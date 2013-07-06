/**
 * Module dependencies.
 */

var debug = require('debug')('engine.io-reconnect');

// Get bind component for node and browser.
var bind;
try {
  bind = require('bind');
} catch(e){
  bind = require('bind-component');
}

/**
 * Module exports.
 */

module.exports = Reconnect;

/**
 * `Reconnect` constructor.
 *
 * @param {Socket} engine instance
 * @param {Object} options
 * @api public
 */

function Reconnect(io, opts) {
  if (!(this instanceof Reconnect)) return new Reconnect(io, opts);

  opts = opts || {};
  this.io = io;
  this.attempt = 0;
  this.timeoutTimer = null;
  this.reconnectTimer = null;
  this.attempts(opts.attempts || Infinity);
  this.delay(opts.delay || 1000);
  this.delayMax(opts.delayMax || 5000);
  this.timeout(null == opts.timeout ? 10000 : opts.timeout);
  this.reconnection(null == opts.reconnection ? true : opts.reconnection);

  // we need to overwrite socket close method
  this._close = this.io.close;

  // bind events
  this.bind();
  this.connected = false;
  this.times = 0;

  // lets return the socket object
  return this.io;
}

/**
 * Bind `socket` events.
 *
 * @api private
 */

Reconnect.prototype.bind = function () {

  debug('binding reconnect events and methods');

  // avoid unnecessary binds
  if (this.io.reconnect) return this;

  // overwriting socket close method
  this.io.close = bind(this, 'close');

  // adding reconnect methods to socket
  this.io.reconnect = bind(this, 'reconnect');
  this.io.reconnection = bind(this, 'reconnection');
  this.io.reconnectionDelay = bind(this, 'delay');
  this.io.reconnectionDelayMax = bind(this, 'delayMax');
  this.io.reconnectionTimeout = bind(this, 'timeout');
  this.io.reconnectionAttempts = bind(this, 'attempts');

  // caching event functions
  this.onclose = bind(this, 'onclose');

  // doing the actuall bind
  this.io.on('close', this.onclose);
};

/**
 * Close the current socket.
 *
 * @api private
 */

Reconnect.prototype.close = function () {
  this.skip = true;
  // lets return the original close output
  return this._close.call(this.io);
};

/**
 * Called upon engine close.
 *
 * @api private
 */

Reconnect.prototype.onclose = function (reason, desc) {
  //this.check();
  this.connected = false;
  if (!this.skip && this._reconnection) {
    this.reconnect();
  } else {
    this.clear();
  }
};

/**
 * Called upon connection error.
 *
 * @api private
 */

Reconnect.prototype.onerror = function (error) {
  if (this.reconnecting) {
    debug('reconnect attempt error');
    this.reconnect();
    this.io.emit('connect_error', error);
  }
  return this;
};

/**
 * Clean timers.
 *
 * @api private
 */

Reconnect.prototype.clear = function () {
  clearTimeout(this.reconnectTimer);
  clearTimeout(this.timeoutTimer);
  clearTimeout(this.checkTimer);
  this.reconnectTimer = null;
  this.timeoutTimer = null;
  this.checkTimer = null;
  return this;
};

/**
 * Sets the `reconnection` config.
 *
 * @param {Boolean} true/false if it should automatically reconnect
 * @return {Reconnect} self or value
 * @api public
 */

Reconnect.prototype.reconnection = function (v) {
  if (!arguments.length) return this._reconnection;
  this._reconnection = !!v;
  return this;
};

/**
 * Sets the reconnection attempts config.
 *
 * @param {Number} max reconnection attempts before giving up
 * @return {Reconnect} self or value
 * @api public
 */

Reconnect.prototype.attempts = function (v) {
  if (!arguments.length) return this._attempts;
  this._attempts = v;
  return this;
};

/**
 * Sets the delay between reconnections.
 *
 * @param {Number} delay
 * @return {Reconnect} self or value
 * @api public
 */

Reconnect.prototype.delay = function (v) {
  if (!arguments.length) return this._delay;
  this._delay = v;
  return this;
};

/**
 * Sets the maximum delay between reconnections.
 *
 * @param {Number} delay
 * @return {Reconnect} self or value
 * @api public
 */

Reconnect.prototype.delayMax = function (v) {
  if (!arguments.length) return this._delayMax;
  this._delayMax = v;
  return this;
};

/**
 * Sets the connection timeout. `false` to disable
 *
 * @return {Reconnect} self or value
 * @api public
 */

Reconnect.prototype.timeout = function (v) {
  if (!arguments.length) return this._timeout;
  this._timeout = v;
  return this;
};

/**
 * Attempt to re-open `socket` connection.
 *
 * @return {Reconnect} self
 * @api private
 */

Reconnect.prototype.open = function(fn) {
  this.io.open();
  this.on('open', fn);
  this.on('error', fn);

  if (false !== this._timeout && !this.timeoutTimer) {
    debug('connect attempt will timeout after %d', this._timeout);
    this.timeoutTimer = setTimeout(bind(this, function () {
      debug('connect attempt timed out after %d', this._timeout);
      this.close();
      this.clear();
      this.io.emit('reconnect_timeout', this._timeout);
    }), this._timeout);
  }
};

/*Reconnect.prototype.check = function check() {
  console.log('ATTEMPTS', this.times);
  this.times++;
  if (this.times >= 10) {
    console.log('======== WARNING WARNING STOP STOP PLEASE=========');
    this.checkTimer = setTimeout(bind(this, function(){
      this.close();
      this.clear();
      this.connected = false;
      this.times = 0;
    }), 0);
  }
};*/

/**
 * Attempt a reconnection.
 *
 * @api private
 */

Reconnect.prototype.reconnect = function (){
  this.attempt++;
  this.io.emit('reconnecting', this.attempt);
  if (this.attempt > this.attempts()) {
    this.io.emit('reconnect_failed');
    this.reconnecting = false;
  } else {
    var delay = this.attempt * this.delay();
    debug('will wait %dms before reconnect attempt', delay);
    this.reconnectTimer = setTimeout(bind(this, function() {
      debug('attemptign reconnect');
      this.open(bind(this, function(err){
        if (err) {
          debug('reconnect attempt error');
          this.reconnect();
          this.io.emit('reconnect_error', err);
        } else {
          debug('reconnect success');
          this.onreconnect();
        }
      }));
    }), delay);
  }
};

/**
 * Called upon successful reconnect.
 *
 * @api private
 */

Reconnect.prototype.onreconnect = function () {
  var attempt = this.attempt;
  this.attempt = 0;
  this.reconnecting = false;
  this.connected = true;
  this.io.emit('reconnect', attempt);
  return this;
};

/**
 * Little helper for binding events.
 *
 * @api private
 */

Reconnect.prototype.on = function (ev, fn) {
  this.io.off(ev, this['_'+ev]);
  this.io.on(ev, this['_'+ev] = bind(this, fn));
  return this;
};
