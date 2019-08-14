var AVS =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/avs.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/avs.ts":
/*!********************!*\
  !*** ./src/avs.ts ***!
  \********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return AVS; });
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// We will require use of socket client library to talk to socket server.
// let io = require('socket.io-client');
// We will attach events to perform some actions when socket server broadcasts messages
var attachSocketEventHandlers = function attachSocketEventHandlers(socket, avs) {
  /**
  * 
  */
  socket.onopen = function () {
    // inform other peers in the same room that I am connected
    avs.send({
      event: 'peer_connected',
      data: {
        peer_id: socket.id
      }
    }); // socket.broadcast.to(room).emit('peer_connected', socket.id);
  };
  /**
  * 
  */


  socket.onmessage = function (e) {
    // inform other peers in the same room that I am connected
    var msg = JSON.parse(e.data);
    console.log('receive', msg);

    if (msg.event && msg.data) {
      handleEvent(msg.event, msg.data, msg.to);
    }
  };

  function handleEvent(event, data) {
    var to = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    switch (event) {
      case 'peer_connected':
        peer_connected(data.peer_id);
        break;

      case 'connected_to_peer':
        if (socket.id == to) {
          connected_to_peer(data.peer_id);
        }

        break;

      case 'receive_offer':
        if (socket.id == to) {
          receive_offer(data.peer_id, data.message);
        }

        break;

      case 'receive_answer':
        if (socket.id == to) {
          receive_answer(data.peer_id, data.message);
        }

        break;

      case 'add_candidate':
        if (socket.id == to) {
          add_candidate(data.peer_id, data.message);
        }

        break;

      case 'disconnect_from_peer':
        // todo
        break;
    }
  }
  /**
   * When new user connects the same room, all existing members will get notified by `peer_connected` socket event.
   * This will allow them to establish webRTC connection between the two
  */
  // socket.on('peer_connected', (peer_id) => {


  function peer_connected(peer_id) {
    var pc = new RTCPeerConnection(avs.config);
    pc.peer_id = peer_id;
    attachRPCEventHandlers(pc, avs);

    if (avs.streaming) {
      // If current peer is already sharing screen with other peers, this condition will allow streaming to newly connected peer.
      pc.addStream(avs.stream);
      pc.createOffer().then(function (sdp) {
        return pc.setLocalDescription(sdp);
      }).then(function () {
        avs.send({
          event: 'receive_offer',
          to: peer_id,
          data: {
            peer_id: socket.id,
            message: pc.localDescription
          }
        }); // socket.emit('send_offer', {
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
    }); // socket.emit('connect_to_peer', {
    //   to: peer_id
    // });
  }

  ; // });

  /**
   * When a peer is connected to another peer, this method will attach webRTC event handler to the connection.
  */
  // socket.on('connected_to_peer', (peer_id) => {

  function connected_to_peer(peer_id) {
    var pc = new RTCPeerConnection(avs.config);
    pc.peer_id = peer_id;
    attachRPCEventHandlers(pc, avs);
    avs.peers.push(pc);
  }

  ; // });

  /**
   * When a peer disconnects with other peers in any way, other peers are notified with `disconnect_from_peer` event.
   * This will be used for closing the RPC connection between the two.
   */
  // socket.on('disconnect_from_peer', (peer_id) => {

  function disconnect_from_peer(peer_id) {
    avs.peers = avs.peers.filter(function (p) {
      if (p.peer_id == peer_id) {
        p.close();
        return false;
      } else {
        return true;
      }
    });
  }

  ; // });

  /**
   * When one peers wants to establish connection with current peer, he sends offer, so current peer can listen to that event by `receive_offer` event. It will also set remote description over webRTC connection, and will send answer for offer by sending `send_answer` event.
   */
  // socket.on('receive_offer', (id, msg) => {

  function receive_offer(peer_id, msg) {
    avs.peers.forEach(function (peer) {
      peer.getSenders().forEach(function (track) {
        peer.removeTrack(track);
      });
    });
    var peer = avs.peers.find(function (p) {
      return p.peer_id == peer_id;
    });
    peer.setRemoteDescription(msg).then(function () {
      return peer.createAnswer();
    }).then(function (sdp) {
      return peer.setLocalDescription(sdp);
    }).then(function () {
      avs.send({
        event: 'receive_answer',
        to: peer.peer_id,
        data: {
          peer_id: socket.id,
          message: peer.localDescription
        }
      }); // socket.emit('send_answer', {
      //   to: peer.peer_id,
      //   message: peer.localDescription
      // });
    });
  }

  ; // });

  /**
   * When one peer sends answer of the offer by this peer, This peer can receive the answer by `receive_answer` event. 
   * This listener is used to set remote description to the webRTC connection
   */
  // socket.on('receive_answer', (id, msg) => {

  function receive_answer(id, msg) {
    var peer = avs.peers.find(function (p) {
      return p.peer_id == id;
    });
    peer.setRemoteDescription(msg);
  }

  ; // });

  /**
   * `add_candidate` event listener is for listening to ice servers. The turn/stun server will be added to the icecandidate list of the rtc connection.
   */
  // socket.on('add_candidate', (id, msg) => {

  function add_candidate(id, msg) {
    var peer = avs.peers.find(function (p) {
      return p.peer_id == id;
    });
    peer.addIceCandidate(msg);
  }

  ; // });
}; // Listen for RPC events, when some media get streamed, or when new STUN/TURN server is found.


var attachRPCEventHandlers = function attachRPCEventHandlers(peer, avs) {
  /**
   * This listener is used to get stream from the peer who is sharing screen, and add that stream to the video Element of the receiver.
   */
  peer.ontrack = function (event) {
    avs.videoElem.srcObject = event.streams[0];
    avs.videoElem.play().then()["catch"](function (e) {
      console.error('Media cannot be played automatically without user interaction with page.', e);
    });
  };
  /**
   * when ice candidate of other peers are available, this listener can be used to connect to them, via stun/turn
   */


  peer.onicecandidate = function (ice) {
    if (ice.candidate && ice.candidate.candidate) {
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
  };
};
/*
  AVS - Stands for Audio-Video-Screen is a plugin to stream the media through WebRTC channel among the peers connected to it.
*/


var AVS =
/*#__PURE__*/
function () {
  // Plugin Version

  /*
    variables definition
  */
  // this property will hold the namespace of all peers gathering. All Peers in same room will be interconnected via seperate RPC Connections
  // this property will hold the stream data audio, video or screen record from the host who is broadcasting
  // this indicates where the current peer is host, i.e. he is broadcasting if true 
  // socket connection needed for messaging between peers for exchanging offer and answer of RPC connection, i.e. socket is Signaling Channel
  // list of RPC connected peers, with their socket id
  // the HTML Video element by which the stream will be binded
  // ice server configuration, must be setup by user using the plugin, as it will be dynamic

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
  function AVS(config) {
    _classCallCheck(this, AVS);

    _defineProperty(this, "_version", 0.01);

    _defineProperty(this, "room", void 0);

    _defineProperty(this, "stream", void 0);

    _defineProperty(this, "streaming", false);

    _defineProperty(this, "socket", void 0);

    _defineProperty(this, "peers", []);

    _defineProperty(this, "videoElem", void 0);

    _defineProperty(this, "config", {
      iceServers: []
    });

    this.socket = new WebSocket(config.wss);
    this.socket.id = Math.random().toString().slice(2); // this.socket.emit('join', config.room || '_room');

    attachSocketEventHandlers(this.socket, this);
    this.videoElem = config.videoElem || document.getElementById('viewBroadcast');
    this.config = {
      iceServers: config.iceServers || []
    };
    this.room = config.room;
  }
  /**
   * This method can be called by avs instance to start sharing screen, it will automatically call, `startStreaming` method after the stream is available 
   */


  _createClass(AVS, [{
    key: "shareScreen",
    value: function shareScreen() {
      var _this = this;

      if (navigator.getDisplayMedia) {
        navigator.getDisplayMedia().then(function (stream) {
          _this.startStreaming(stream);
        });
      } else if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia().then(function (stream) {
          _this.startStreaming(stream);
        });
      }
    }
    /**
     * start streaming method is used to start stream to all peers which are connected to this peer.
     */

  }, {
    key: "startStreaming",
    value: function startStreaming(stream) {
      var _this2 = this;

      this.stream = stream;
      this.streaming = true;

      if (this.videoElem) {
        this.videoElem.srcObject = stream;
        this.videoElem.play();
      }

      this.peers.forEach(function (peer) {
        peer.addStream(_this2.stream);
        peer.createOffer().then(function (sdp) {
          return peer.setLocalDescription(sdp);
        }).then(function () {
          _this2.send({
            event: 'receive_offer',
            to: peer.peer_id,
            data: {
              peer_id: _this2.socket.id,
              message: peer.localDescription
            }
          }); // this.socket.emit('send_offer', {
          //   to: peer.peer_id,
          //   message: peer.localDescription
          // });

        });
      });
    }
  }, {
    key: "send",
    value: function send(msg) {
      console.log('send', msg);
      this.socket.send(JSON.stringify({
        message_type: "MESSAGE_BROADCAST",
        message_details: msg
      }));
    }
  }]);

  return AVS;
}();



/***/ })

/******/ })["default"];
//# sourceMappingURL=avs.min.js.map