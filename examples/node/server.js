var http = require('http');
var engine = require('engine.io');
var server = http.createServer();
var io = engine.attach(server);

// Server stuff
io.on('connection', function(conn){
  console.log('CLIENT', conn.id, 'CONNECTED');

  //conn.close();

  setTimeout(function () {
    conn.close();
  }, 0);

  conn.on('message', function (data) {
    console.log(data);
  });
});

server.listen(process.env.PORT || 8080, function(){
  console.log('\033[96mlistening on localhost:9000 \033[39m');
});
