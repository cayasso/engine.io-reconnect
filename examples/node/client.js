var reconnect = require('../../');
var client = require('engine.io-client');

// Add room functionality to io
var eio = client('ws://localhost:8080');
var io = reconnect(eio, { /*reconnection: true*/ });

io.on('close', function () {
  console.log('closing connection');
});

setTimeout(function () {
  io.close();  
}, 50);
