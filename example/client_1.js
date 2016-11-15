'use strict';

const co = require('co');
const debug = require('debug')('socket-msessenger:client_1');

const SocketMessenger = require('../');
const MailBox = SocketMessenger.MailBox;

co(function* gen() {
  const mailBox = new MailBox({ name: 'client_1' });
  yield mailBox.init();
  const mail = mailBox.writeMails();

  mailBox.on('mail', mail2 => {
    mail2.reply('reply');
  });

  yield mail.setTo('client_2')
      .setMessage('hello world')
      .send();
}).catch(error => console.error(error.stack));
