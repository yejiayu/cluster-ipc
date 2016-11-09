'use strict';

const co = require('co');

const SocketMessenger = require('../');
const Messenger = SocketMessenger.Messenger;

co(function* gen() {
  const messenger = new Messenger();
  yield messenger.init();
}).catch(error => console.error(error.stack));
