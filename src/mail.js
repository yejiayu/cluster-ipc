'use strict';

const EventEmitter = require('events');
const is = require('is-type-of');
const debug = require('debug')('socket-msessenger:mail');


class Mail extends EventEmitter {
  constructor({ from, id, client, isReply = false, timeout }) {
    super();

    this.client = client;
    this.timeout = timeout;

    this.from = from;
    this.id = id;
    this.to = null;
    this.message = null;
    this.isReply = isReply;
  }

  static wrapMail(mail = {}, client) {
    const { from, id, message, to, isReply } = mail;

    return new Mail({ from, id, client, isReply })
        .target(to)
        .setMessage(message);
  }

  target(to) {
    this.to = to;

    return this;
  }

  message(message) {
    this.message = message;

    return this;
  }

  send({ duplex = true } = {}) {
    this.client.send(this.toJSON());

    if (!duplex || this.isReply) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const id = this.id;

      const timeoutFlag = setTimeout(() => {
        this.removeAllListeners();
        return reject();
      }, this.timeout);

      this.once(`reply#${id}`, reply => {
        clearTimeout(timeoutFlag);
        return resolve(reply);
      });
    });
  }

  reply(message) {
    const { from: to, to: from, client, id } = this;

    return new Mail({ from, client, id, isReply: true })
        .target(to)
        .setMessage(message)
        .send();
  }

  toJSON() {
    const { id, to, from, message, isReply } = this;

    return { id, to, from, message, isReply };
  }
}

module.exports = Mail;
