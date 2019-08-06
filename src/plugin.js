io = require('socket.io-client')

let socket = io()

class AVS {

  _version = 0.01;

  /* 
    This function can be called to create a session, it should return a random id, and have socket connected to it.
  */
  startSession() {
    console.log("hello");
  }
}

module.exports = AVS