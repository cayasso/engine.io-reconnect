# Engine.IO Reconnect

[![Build Status](https://travis-ci.org/cayasso/engine.io-reconnect.png?branch=master)](https://travis-ci.org/cayasso/engine.io-reconnect)
[![NPM version](https://badge.fury.io/js/engine.io-reconnect.png)](http://badge.fury.io/js/engine.io-reconnect)

Simple reconnect wrapper for engine.io-client.

## Instalation

```
npm install engine.io-reconnect
```

## Usage

### On the Client

```
var reconnect = require('engine.io-reconnect');
var client = require('engine.io-client');

// Add reconnect functionality to eio
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

```

## Run tests

```
make test
```

## License

(The MIT License)

Copyright (c) 2013 Jonathan Brumley &lt;cayasso@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
