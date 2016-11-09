'use strict';

const assert = require('assert');
const EventEmitter = require('events');
const is = require('is-type-of');
const debug = require('debug')('socket-msessenger:mail-box');

const { SOCK_PATH, TIMEOUT_TIME } = require('./constant');
const { generateMailNo } = require('./util');
const Client = require('./socket/client');
const Mail = require('./mail');

class MailBox extends EventEmitter {
  constructor({ name }) {
    super();

    assert(is.string(name) && name.length > 0, 'options.name required');
    assert(name.indexOf('#') === -1, 'options.name not include #');

    this.name = name;
    this.autoIncrement = 0;
    this.box = new Map();

    this.client = new Client({ sockPath: SOCK_PATH, name });
  }

  init() {
    return new Promise((resolve, reject) => {
      const timeoutFlag = setTimeout(reject, 1000 * 20);
      this.client.ready(() => {
        clearTimeout(timeoutFlag);
        this.client.on('mail', mail => this.onMailHandler(mail));
        return resolve();
      });
    });
  }

  writeMails({ timeout = TIMEOUT_TIME } = {}) {
    if (!this.client.hasReady) {
      throw new Error('perform the init method');
    }

    const { name: from, client } = this;

    this.autoIncrement = this.autoIncrement + 1;
    const id = generateMailNo(from, this.autoIncrement);

    const mail = new Mail({ from, id, client, timeout });
    this.box.set(id, mail);

    return mail;
  }

  onMailHandler(mail) {
    const { isReply, id } = mail;

    const wrapMail = Mail.wrapMail(mail, this.client);
    if (isReply) {
      const nativeMail = this.box.get(id);


      nativeMail.emit(`reply#${id}`, wrapMail);
      this.box.delete(id);
    } else {
      this.emit('mail', wrapMail);
    }
  }
}

module.exports = MailBox;