var Turn = require('node-turn');
var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', function(socket){
  console.log(socket.id+' connected');
  socket.on('join', function(room) {
    socket.join(room);
    socket.broadcast.to(room).emit('peer_connected', socket.id);
  });
  socket.on('connect_to_peer', function(data) {
    socket.broadcast.to(data.to).emit('connected_to_peer', socket.id);
  });
  socket.on('send_offer', function(data) {
    socket.broadcast.to(data.to).emit('receive_offer', socket.id, data.message);
  });
  socket.on('send_answer', function(data) {
    socket.broadcast.to(data.to).emit('receive_answer', socket.id, data.message);
  });
  socket.on('candidate_available', function(data) {
    socket.broadcast.to(data.to).emit('add_candidate', socket.id, data.message);
  });
  socket.on('candidate', function (message) {
    console.log('candidate');
    console.log(message);
    io.emit('candidate', message);
  });
  socket.on('offer', (message) => {
    console.log('offer');
    console.log(message);
    io.to(message.room).emit('offer', message);
  });
  socket.on('answer', (message) => {
    console.log('answer');
    console.log(message);
    io.to(message.room).emit('answer', message);
  });
});

/* 
  Start STUN/TURN Server
*/
(function() {
  var server = new Turn({
    listeningIps: ['192.168.0.104'],
    authMech: 'long-term',
    credentials: {
      username: "password"
    }
  });
  server.start();
  console.log('TURN server listening on *:3478');
})();

/* 
  Start Express Server
*/
http.listen(5000, () => {
  console.log('HTTP server listening on *:5000');
});