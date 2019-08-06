import io from 'socket.io-client';

const socket = io('http://localhost:5000');
console.log("socket");

// (function() {
//   // Define Constructor
//   this.AVS = function() {
//     const defaults = {
//       site_id: '1'
//     };
//     if (arguments[0] && typeof arguments[0] === "object") {
//       this.options = extendDefaults(defaults, arguments[0]);
//     }
//   }
//   // Public Methods
//   AVS.prototype.init = function() {
//     // initialize session here based on site, all peers will connect to this session id,
    
//     // return a session id

//   }
//   // Private Methods
//   function extendDefaults(source, properties) {
//     var property;
//     for (property in properties) {
//       if (properties.hasOwnProperty(property)) {
//         source[property] = properties[property];
//       }
//     }
//     return source;
//   }
// }());