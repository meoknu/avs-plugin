let io = require('socket.io-client')
let socket = null;

class AVS {

  _version = 0.01;
  room;
  sspc;
  vspc;
  aspc;
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

  constructor() {
    
  }

  /* 
    This function can be called to initialize a session,
    it should return a random room id,
    and have socket connected to it.
    Also create a RPC Connection
  */
  async init() {
    this.room = '121'; // Math.random().toString().substring(2)
    socket = await io();
    await socket.emit('join', this.room);
    this.initListeners();
    this.sspc = new RTCPeerConnection(this.config);
    window.sspc = this.sspc;
    return this.room;
  }

  async shareScreen() {
    const stream = await navigator.mediaDevices.getDisplayMedia();
    this.sspc.addStream(stream);
    const sdp = await this.sspc.createOffer();
    await this.sspc.setLocalDescription(sdp);
    console.log(sdp);
    socket.emit('offer', {
      room: this.room,
      description: this.sspc.localDescription
    });
  }

  initListeners() {
    socket.on('offer', (message) => {
      console.log('offer received');
      console.log(this.sspc.localDescription);
      console.log(message.description);
      console.log(this.sspc.localDescription.sdp == message.description.sdp);
      // if(message.description.sdp != this.sspc.localDescription.sdp) {
        this.sspc.setRemoteDescription(message.description).then(() => {
          return this.sspc.createAnswer()
        }).then((sdp) => {
          return this.sspc.setLocalDescription(sdp)
        }).then(() => {
          socket.emit('answer', {
            room: this.room,
            description: this.sspc.localDescription
          });
        });
      // }
    });
    socket.on('answer', (message) => {
      console.log('got answer');
      console.log(message);
      this.sspc.setRemoteDescription(message.description);
    });
  }
}

export default AVS