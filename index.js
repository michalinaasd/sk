var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

remove = function(array, element){
  const index = array.indexOf(element);
  array.splice(index, 1);
}


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
var bulletArray = [];
maxX = 1000;
maxY = 800;

class player {
  constructor(){
    this.x = 300;
    this.y = 300;
    this.angle = 0;
    this.rotateSpeed = 0.001;
    this.radius = 15;
    this.vertAngle = ((Math.PI*2)/3);
    this.radians = 0;
    this.vel = 0;

  }
  rotate(dir){
    this.angle += this.rotateSpeed * dir;
    this.radians = this.angle/Math.PI*180;
  }
  move(){
    this.x += this.vel;
  }
}

class bullets {
  constructor(posx, posy) {
    this.vel = 20;
    this.posx = posx;
    this.posy = posy;
    
  }
  fireBullet () {
    if(this.posx > 0 && this.posy > 0){
      this.posx -= this.vel;
      this.posy -= this.vel;
      //console.log(this.posy, this.posx);
      setTimeout(()=>{
        this.fireBullet();
      }, 1000);
    }
    else{
      delete this;
      remove(bulletArray, this);
    }
  
  };
}

io.on('connection', function(socket) {
  socket.on('new player', function() {
    var newplayer = new player();
    players[socket.id] = newplayer;
  });
  socket.on('fire', function(data){
    var player = players[socket.id] || {};
    var newBullet = new bullets(player.x, player.y);
    bulletArray.push(newBullet);
    setTimeout(()=>{
      newBullet.fireBullet();
    }, 250);
    
  });
  socket.on('movement', function(data) {
    var player = players[socket.id] || {};
    if (data.left) {
        if(player.x < 0){
            player.x = 0;
        }
        else{player.rotate(-1);}
    }
    if (data.up) {
        if(player.y < 0){
            player.y = 0;
        }
        else{player.vel += 1;} 
    }
    if (data.right) {
        if(player.x > maxX){
            player.x = maxX;
        }
        else{player.rotate(1);}
    }
    if (data.down) {
        if(player.y > maxY){
            player.y = maxY;
        }
        else{player.vel = -player.vel;}
    }
    if(data.fire){
      data.fire = false;
    }
  });

});

setInterval(function() {
  io.sockets.emit('state', players, bulletArray);
}, 1000 / 60);