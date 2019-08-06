var Turn = require('node-turn');
var app = require('http').createServer({
  host: '0.0.0.0'
})
var io = require('socket.io')(app);

var server = new Turn({
  listeningIps: ['192.168.0.11'],
  authMech: 'long-term',
  credentials: {
    username: "password"
  }
});
server.start();
console.log('server started');

app.listen(5000);

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