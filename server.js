var Turn = require('node-turn');

var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', function(socket){
  console.log(socket.id+' connected');
  socket.on('join', function(room) {
    socket.join(room);
  });
  socket.on('candidate', function (candidate) {
    console.log('candidate');
    io.emit('candidate', candidate);
  });
  socket.on('offer', (message) => {
    console.log('offer');
    console.log(message);
    io.emit('offer', message);
  });
  socket.on('answer', (message) => {
    console.log('answer');
    console.log(message);
    io.emit('answer', message);
  });
});

/* 
  Start STUN/TURN Server
*/
(function() {
  var server = new Turn({
    listeningIps: ['192.168.0.11'],
    authMech: 'long-term',
    credentials: {
      username: "password"
    }
  });
  server.start();
  console.log('stun/turn server listening on *:3478');
})();

/* 
  Start Express Server
*/
http.listen(5000, () => {
  console.log('express server listening on *:5000');
});