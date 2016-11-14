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

    mailBox.writeMails().target('client_1')
        .setMessage('hello 1')
        .send()
        .then(reply => {
          debug(reply.toJSON());
        });

    mailBox.writeMails().target('client_1')
        .setMessage('hello 2')
        .send()
        .then(reply => {
          debug(reply.toJSON());
        });
  });
}).catch(error => console.error(error.stack));
