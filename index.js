var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);


app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

var players = {};
var bullets = {};
io.on('connection', function(socket) {
  socket.on('new player', function() {
    maxX = 800;
    maxY = 1000;
    players[socket.id] = {
      x: 300,
      y: 300
    };
  });
  socket.on('movement', function(data) {
    var player = players[socket.id] || {};
    if (data.left) {
        if(player.x < 0){
            player.x = 0;
        }
        else{player.x -= 5;}
    }
    if (data.up) {
        if(player.y < 0){
            player.y = 0;
        }
        else{player.y -= 5;} 
    }
    if (data.right) {
        if(player.x > maxX){
            player.x = maxX;
        }
        else{player.x += 5;}
    }
    if (data.down) {
        if(player.y > maxY){
            player.y = maxY;
        }
        else{player.y += 5;}
    }
    if(data.fire){
      console.log('fire');
    }
  });
});

setInterval(function() {
  io.sockets.emit('state', players);
}, 1000 / 60);