var reconnect = require('../../');
var client = require('engine.io-client');

// Add room functionality to io
var eio = client('ws://localhost:8080');
var io = reconnect(eio);

var io.on('reconnect', function(attempts) {
  console.log('Reconnected after %d attempts', attempts);
});
