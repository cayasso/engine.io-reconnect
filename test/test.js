
var reconnect = require('../index');
var eio = require('engine.io');
var ioc = require('engine.io-client');
var http = require('http').Server;
var expect = require('expect.js');

// creates a conn.io client for the given server
function client(srv, port){
  var addr = srv.address();
  var url = 'ws://' + addr.address + ':' + (port || addr.port);
  return reconnect(ioc(url));
}

describe('engine.io-reconnect', function () {

  it('should have required methods', function(done){
    var srv = http();
    var io = eio.attach(srv);
    srv.listen(function(){
      var ioc = client(srv);
      expect(ioc.reconnect).to.be.a('function');
      expect(ioc.reconnection).to.be.a('function');
      expect(ioc.reconnectionAttempts).to.be.a('function');
      expect(ioc.reconnectionDelay).to.be.a('function');
      expect(ioc.reconnectionDelayMax).to.be.a('function');
      expect(ioc.reconnectionTimeout).to.be.a('function');
      done();
    });
  });

  it('should try reconnecting when server is down', function(done){
    this.timeout(0);
    var reconnect = false;
    var opened = 0;
    var srv = http();
    var io = eio.attach(srv);
    
    srv.listen(8081, function(){
      io.on('connection', function(conn){
        srv.close();
      });
    });
    
    setTimeout(function (){
      var ioc = client(srv, 8081);
      ioc.on('reconnect', function(attempts){
        reconnect = true;
        expect(reconnect).to.equal(true);
        done();
      });
      setTimeout(function () {
        srv.listen(8081);
      }, 100);
    }, 100);
  });

  it('should not reconnect on intentional close', function(done){
    var srv = http();
    var io = eio.attach(srv);
    srv.listen(function(){
      var ioc = client(srv);
      ioc.on('close', function(){
        done();
      });
      ioc.on('reconnect', function(){
        done(new Error('not'));
      });
      ioc.on('open', function () {
        ioc.close();
      });
    });
  });

  
});