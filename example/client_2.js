'use strict';

const co = require('co');
const debug = require('debug')('socket-msessenger:client_2');

const SocketMessenger = require('../');
const MailBox = SocketMessenger.MailBox;

co(function* gen() {
  const mailBox = new MailBox({ name: 'client_2' });
  yield mailBox.init();
  mailBox.on('mail', mail => {
    mail.reply('reply hello world');
  });
}).catch(error => console.error(error.stack));
