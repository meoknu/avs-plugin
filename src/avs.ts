let io = require('socket.io-client');

let attachSocketEventHandlers = (socket, avs) => {

  socket.on('peer_connected', (peer_id) => {
    console.log(peer_id);
    const pc = new RTCPeerConnection(avs.config);
    pc.peer_id = peer_id;
    attachRPCEventHandlers(pc, avs);
    if(avs.streaming) {
      pc.addStream(avs.stream);
      pc.createOffer().then((sdp) => {
        return pc.setLocalDescription(sdp);
      }).then(() => {
         socket.emit('send_offer', {
           to: pc.peer_id,
           message: pc.localDescription
         });
      });
    }
    avs.peers.push(pc);
    socket.emit('connect_to_peer', {
      to: peer_id
    });
  });

  socket.on('connected_to_peer', (peer_id) => {
    var pc = new RTCPeerConnection(avs.config);
    pc.peer_id = peer_id;
    attachRPCEventHandlers(pc, avs);
    avs.peers.push(pc);
  });

  socket.on('disconnect_from_peer', (peer_id) => {
    avs.peers = avs.peers.filter((p) => {
      if(p.peer_id == peer_id) {
        p.close();
        return false;
      } else {
        return true;
      }
    });
  });

  socket.on('receive_offer', (id, msg) => {
    avs.peers.forEach((peer) => {
      peer.getSenders().forEach((track) => {
        peer.removeTrack(track);
      });
    });
    var peer = avs.peers.find(p => p.peer_id == id);
    peer.setRemoteDescription(msg).then(() => {
      return peer.createAnswer();
    }).then((sdp) => {
      return peer.setLocalDescription(sdp);
    }).then(() => {
      socket.emit('send_answer', {
        to: peer.peer_id,
        message: peer.localDescription
      });
    });
  });

  socket.on('receive_answer', (id, msg) => {
    var peer = avs.peers.find(p => p.peer_id == id);
    peer.setRemoteDescription(msg);
  });

  socket.on('add_candidate', (id, msg) => {
    var peer = avs.peers.find(p => p.peer_id == id);
    peer.addIceCandidate(msg);
  });

}

let attachRPCEventHandlers = (peer, avs) => {

  peer.ontrack = (event) => {
    let v = document.createElement('video');
    v.height = 100;
    v.controls = true;
    v.autoplay = true;
    v.srcObject = event.streams[0];
    document.body.appendChild(v);
  }
  peer.onicecandidate = (ice) => {
    // console.log(ice.candidate);
    if(ice.candidate && ice.candidate.candidate) {
      avs.socket.emit('candidate_available', {
        to: peer.peer_id,
        message: ice.candidate
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

  config = {
    iceServers: [
      {
        urls: ['stun:27.5.7.57']
      },
      {
          urls: ['turn:27.5.7.57'],
          username: 'username',
          credential: 'password'
      }
    ]
  }

  constructor(config) {
    this.socket = io('http://localhost:5000');
    this.socket.emit('join', '_room');
    attachSocketEventHandlers(this.socket, this);
    this.videoElem = document.getElementById('viewBroadcast');
  }

  broadcast() {
    navigator.mediaDevices.getDisplayMedia({video: true, audio: true}).then((stream) => {
      this.stream = stream;
      this.streaming = true;
      let v = document.createElement('video');
      v.height = 100;
      v.controls = true;
      v.autoplay = true;
      v.srcObject = stream;
      document.body.appendChild(v);
      // pc.addStream(stream);
      this.startStreaming();
    });
  }

  startStreaming() {
    this.peers.forEach((peer) => {
      peer.addStream(this.stream);
      peer.createOffer().then((sdp) => {
        return peer.setLocalDescription(sdp);
      }).then(() => {
         this.socket.emit('send_offer', {
           to: peer.peer_id,
           message: peer.localDescription
         });
      });
    });
  }

  /* 
    This function can be called to initialize a session,
    it should return a random room id,
    and have socket connected to it.
    Also create a RPC Connection
  */
  // async init() {
  //   this.room = '121'; // Math.random().toString().substring(2)
  //   socket = await io();
  //   await socket.emit('join', this.room);
  //   this.initListeners();
  //   this.sspc = new RTCPeerConnection(this.config);
  //   window.sspc = this.sspc;
  //   return this.room;
  // }

  // async shareScreen() {
  //   const stream = await navigator.mediaDevices.getDisplayMedia();
  //   this.sspc.addStream(stream);
  //   const sdp = await this.sspc.createOffer();
  //   await this.sspc.setLocalDescription(sdp);
  //   console.log(sdp);
  //   socket.emit('offer', {
  //     room: this.room,
  //     description: this.sspc.localDescription
  //   });
  // }

  // initListeners() {
  //   socket.on('offer', (message) => {
  //     console.log('offer received');
  //     console.log(this.sspc.localDescription);
  //     console.log(message.description);
  //     console.log(this.sspc.localDescription.sdp == message.description.sdp);
  //     // if(message.description.sdp != this.sspc.localDescription.sdp) {
  //       this.sspc.setRemoteDescription(message.description).then(() => {
  //         return this.sspc.createAnswer()
  //       }).then((sdp) => {
  //         return this.sspc.setLocalDescription(sdp)
  //       }).then(() => {
  //         socket.emit('answer', {
  //           room: this.room,
  //           description: this.sspc.localDescription
  //         });
  //       });
  //     // }
  //   });
  //   socket.on('answer', (message) => {
  //     console.log('got answer');
  //     console.log(message);
  //     this.sspc.setRemoteDescription(message.description);
  //   });
  // }
}