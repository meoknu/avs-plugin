// We will require use of socket client library to talk to socket server.
// let io = require('socket.io-client');

let adapter = require('webrtc-adapter');

// We will attach events to perform some actions when socket server broadcasts messages
let attachSocketEventHandlers = (socket, avs) => {

  /**
  * 
  */
  socket.onopen = () => {
    // inform other peers in the same room that I am connected
    avs.send({
      event: 'peer_connected',
      data: {
        peer_id: socket.id
      }
    });
    // socket.broadcast.to(room).emit('peer_connected', socket.id);
  }

  /**
  * 
  */
  socket.onmessage = (e) => {
    // inform other peers in the same room that I am connected
    var msg = JSON.parse(e.data);
    console.log('receive', msg);
    if(msg.event && msg.data) {
      handleEvent(msg.event, msg.data, msg.to);
    }
  }

  function handleEvent(event, data, to=null) {
    switch (event) {
      case 'peer_connected':
        peer_connected(data.peer_id);
        break;
      case 'connected_to_peer':
        if(socket.id == to) { connected_to_peer(data.peer_id); }
        break;
      case 'receive_offer':
        if(socket.id == to) { receive_offer(data.peer_id, data.message); }
        break;
      case 'receive_answer':
        if(socket.id == to) { receive_answer(data.peer_id, data.message); }
        break;
      case 'add_candidate':
        if(socket.id == to) { add_candidate(data.peer_id, data.message); }
        break;
        closeStream(data.peer_id);
        break;
      case 'disconnect_from_peer':
        // todo
        break;
    }

  }
  function closeStream(peer_id) {
      alert('streaming is closed');
      if (avs.videoElem) {
          avs.videoElem.srcObject = null;
      }
  }

  /**
   * When new user connects the same room, all existing members will get notified by `peer_connected` socket event.
   * This will allow them to establish webRTC connection between the two
  */
  // socket.on('peer_connected', (peer_id) => {
  function peer_connected(peer_id) {
    const pc = new RTCPeerConnection(avs.config);
    pc.peer_id = peer_id;
    attachRPCEventHandlers(pc, avs);
    if(avs.streaming) { // If current peer is already sharing screen with other peers, this condition will allow streaming to newly connected peer.
      pc.addStream(avs.stream);
      pc.createOffer().then((sdp) => {
        return pc.setLocalDescription(sdp);
      }).then(() => {
        avs.send({
          event: 'receive_offer',
          to: peer_id,
          data: {
            peer_id: socket.id,
            message: pc.localDescription
          }
        });
         // socket.emit('send_offer', {
         //   to: pc.peer_id,
         //   message: pc.localDescription
         // });
      });
    }
    avs.peers.push(pc);
    avs.send({
      event: 'connected_to_peer',
      to: peer_id,
      data: {
        peer_id: socket.id
      }
    });
    // socket.emit('connect_to_peer', {
    //   to: peer_id
    // });
  };
  // });

  /**
   * When a peer is connected to another peer, this method will attach webRTC event handler to the connection.
  */
  // socket.on('connected_to_peer', (peer_id) => {
  function connected_to_peer(peer_id) {
    var pc = new RTCPeerConnection(avs.config);
    pc.peer_id = peer_id;
    attachRPCEventHandlers(pc, avs);
    avs.peers.push(pc);
  };
  // });

  /**
   * When a peer disconnects with other peers in any way, other peers are notified with `disconnect_from_peer` event.
   * This will be used for closing the RPC connection between the two.
   */
  // socket.on('disconnect_from_peer', (peer_id) => {
  function disconnect_from_peer(peer_id) {
    avs.peers = avs.peers.filter((p) => {
      if(p.peer_id == peer_id) {
        p.close();
        return false;
      } else {
        return true;
      }
    });
  };
  // });

  /**
   * When one peers wants to establish connection with current peer, he sends offer, so current peer can listen to that event by `receive_offer` event. It will also set remote description over webRTC connection, and will send answer for offer by sending `send_answer` event.
   */
  // socket.on('receive_offer', (id, msg) => {
  function receive_offer(peer_id, msg) {
    avs.peers.forEach((peer) => {
      peer.getSenders().forEach((track) => {
        peer.removeTrack(track);
      });
    });
    var peer = avs.peers.find(p => p.peer_id == peer_id);
    peer.setRemoteDescription(msg).then(() => {
      return peer.createAnswer();
    }).then((sdp) => {
      return peer.setLocalDescription(sdp);
    }).then(() => {
      avs.send({
        event: 'receive_answer',
        to: peer.peer_id,
        data: {
          peer_id: socket.id,
          message: peer.localDescription
        }
      });
      // socket.emit('send_answer', {
      //   to: peer.peer_id,
      //   message: peer.localDescription
      // });
    });
  };
  // });

  /**
   * When one peer sends answer of the offer by this peer, This peer can receive the answer by `receive_answer` event. 
   * This listener is used to set remote description to the webRTC connection
   */
  // socket.on('receive_answer', (id, msg) => {
  function receive_answer(id, msg) {
    var peer = avs.peers.find(p => p.peer_id == id);
    peer.setRemoteDescription(msg);
  };
  // });

  /**
   * `add_candidate` event listener is for listening to ice servers. The turn/stun server will be added to the icecandidate list of the rtc connection.
   */
  // socket.on('add_candidate', (id, msg) => {
  function add_candidate(id, msg) {
    var peer = avs.peers.find(p => p.peer_id == id);
    peer.addIceCandidate(msg);
  };
  // });

}

// Listen for RPC events, when some media get streamed, or when new STUN/TURN server is found.
let attachRPCEventHandlers = (peer, avs) => {

  function closeStream(peer_id) {
      alert('streaming is closed');
      if (avs.videoElem) {
          avs.videoElem.srcObject = null;
      }
  }

  /**
   * This listener is used to get stream from the peer who is sharing screen, and add that stream to the video Element of the receiver.
   */
  peer.ontrack = (event) => {
    peer.oniceconnectionstatechange = (state) => {
      if(peer.iceConnectionState == 'disconnected') {
        closeStream(peer.peer_id);
      }
    }
    // if(event.currentTarget) {
    //   event.currentTarget.oniceconnectionstatechange = (state) => {
    //     if(state.target.iceConnectionState == 'disconnected') {
    //       closeStream(peer.peer_id);
    //     }
    //   }
    // }
    if (avs.videoElem) {
      avs.videoElem.srcObject = event.streams[0];
      avs.videoElem.play().then().catch((e) => {
        console.error('Media cannot be played automatically without user interaction with page.', e);
      });
    }
  }
  /**
   * when ice candidate of other peers are available, this listener can be used to connect to them, via stun/turn
   */
  peer.onicecandidate = (ice) => {
    if(ice.candidate && ice.candidate.candidate) {
      // avs.socket.emit('candidate_available', {
      //   to: peer.peer_id,
      //   message: ice.candidate
      // });
      avs.send({
        event: 'add_candidate',
        to: peer.peer_id,
        data: {
          peer_id: avs.socket.id,
          message: ice.candidate
        }
      });
    }
  }
}

/*
  AVS - Stands for Audio-Video-Screen is a plugin to stream the media through WebRTC channel among the peers connected to it.
*/
export default class AVS {

  // Plugin Version
  _version: number = 0.01;

  /*
    variables definition
  */
  room: string; // this property will hold the namespace of all peers gathering. All Peers in same room will be interconnected via seperate RPC Connections
  stream: any; // this property will hold the stream data audio, video or screen record from the host who is broadcasting
  streaming: boolean = false; // this indicates where the current peer is host, i.e. he is broadcasting if true 
  socket: any; // socket connection needed for messaging between peers for exchanging offer and answer of RPC connection, i.e. socket is Signaling Channel
  peers: any[] = []; // list of RPC connected peers, with their socket id
  videoElem: any; // the HTML Video element by which the stream will be binded

  config: any = { iceServers: [] }; // ice server configuration, must be setup by user using the plugin, as it will be dynamic

  /**
   * 
   * @param config {
   *  wss: "http://wss.olecons.com", // Your Socket Server URL
   *  room: "4653423", // Room to which all peers will be connected 
   *  videoElem: document.getElementById('stream'), // HTML Element where you want to stream video
   *  iceServers: [
   *    {
   *      urls: ['stun:coturn.olecons.com'] // stun url of the coturn server
   *    },
   *    {
   *      urls: ['turns:coturn.olecons.com'], // turns url of the coturn server
   *      username: 'username', // your turn username
   *      credential: 'password' // your turn password
   *    }
   *  ]
   * }
   */
  constructor(config) {
    this.socket = new WebSocket(config.wss);
    this.socket.id = Math.random().toString().slice(2);
    // this.socket.emit('join', config.room || '_room');
    attachSocketEventHandlers(this.socket, this);
    this.videoElem = config.videoElem || document.getElementById('viewBroadcast');
    // Some CSS to prevent right click
    if (this.videoElem) {
        let overlay = document.createElement('div');
        this.videoElem.parentElement.style.position = 'relative';
        overlay.style.position = 'absolute';
        overlay.style.top = "0px";
        overlay.style.left = "0px";
        overlay.style.bottom = "0px";
        overlay.style.right = "0px";
        this.videoElem.parentElement.append(overlay);
    }
    this.config = config.iceConfig;
    this.room = config.room;
  }

  /**
   * This method can be called by avs instance to start sharing screen, it will automatically call, `startStreaming` method after the stream is available 
   */
  shareScreen() {
    if (navigator.getDisplayMedia) {
      navigator.getDisplayMedia().then((stream) => {
        this.startStreaming(stream);
        stream.oninactive = () => {
            this.send({
                event: 'close_stream',
                data: {
                    peer_id: this.socket.id
                }
            });
        }
      });
    } else if (navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia().then((stream) => {
        this.startStreaming(stream);
        stream.oninactive = () => {
            this.send({
                event: 'close_stream',
                data: {
                    peer_id: this.socket.id
                }
            });
        }
      });
    }
  }

  /**
   * start streaming method is used to start stream to all peers which are connected to this peer.
   */
  startStreaming(stream) {
    this.stream = stream;
    this.streaming = true;
    if(this.videoElem) {
      this.videoElem.srcObject = stream;
      this.videoElem.play();
    }
    this.peers.forEach((peer) => {
      peer.addStream(this.stream);
      peer.createOffer().then((sdp) => {
        return peer.setLocalDescription(sdp);
      }).then(() => {
        this.send({
          event: 'receive_offer',
          to: peer.peer_id,
          data: {
            peer_id: this.socket.id,
            message: peer.localDescription
          }    
        });
         // this.socket.emit('send_offer', {
         //   to: peer.peer_id,
         //   message: peer.localDescription
         // });
      });
    });
  }

  send(msg) {
    console.log('send', msg);
    this.socket.send(JSON.stringify({
      message_type: "MESSAGE_BROADCAST",
      message_details: msg
    }));
  }

}