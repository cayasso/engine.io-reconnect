var reconnect = require('../../');
var client = require('engine.io-client');

// Add room functionality to io
var eio = client('ws://localhost:8080');
var io = reconnect(eio);


io.on('reconnect', function(attempts) {
  console.log('Reconnected after %d attempts', attempts);
});

io.on('reconnecting', function(attempts) {
  console.log('Trying to reconnect after %d attempts', attempts);
});

io.on('reconnect_error', function(error) {
  console.log('Error trying to reconnect', error);
});

io.on('reconnect_timeout', function(timeout) {
  console.log('Timeout after %dms', timeout);
});

