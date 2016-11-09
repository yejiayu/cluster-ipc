# socket-messager
> Inter-process communication made simple

## Example
````js
// server.js
const Messenger = require('socket-messenger').Messenger;

co(function* gen() {
  const messenger = new Messenger();
  yield messenger.init();
}).catch(error => console.error(error.stack));

// client_1.js
const MailBox = require('socket-messenger').MailBox;

co(function* gen() {
  const mailBox = new MailBox({ name: 'client_1' });
  yield mailBox.init();
  const mail = mailBox.writeMails();

  const reply = yield mail.target('client_2')
      .message('hello world')
      .send();
  debug(reply.message) // reply hello world
}).catch(error => console.error(error.stack));

// client_2.js
const MailBox = require('socket-messenger').MailBox;

co(function* gen() {
  const mailBox = new MailBox({ name: 'client_2' });
  yield mailBox.init();

  mailBox.on('mail', mail => {
    debug(reply.message) // hello world
    mail.reply('reply hello world');
  });
}).catch(error => console.error(error.stack));
````

> To be perfect