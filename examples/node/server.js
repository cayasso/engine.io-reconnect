var http = require('http');
var engine = require('engine.io');
var server = http.createServer();
var io = engine.attach(server);

// Server stuff
io.on('connection', function(conn){

  // To test just startup this server and then the client
  // then stop this server, you should see the client
  // trying to reconnect.
  console.log('CLIENT', conn.id, 'CONNECTED');
});

server.listen(process.env.PORT || 8080, function(){
  console.log('\033[96mlistening on localhost:9000 \033[39m');
});
