

const assert = require('assert');
const os = require('os');
const path = require('path');
const Base = require('sdk-base');
const is = require('is-type-of');
const debug = require('debug')('socket-msessenger:mail-box');

const { TIMEOUT_TIME, ACTION } = require('./constant');
const { generateMailNo } = require('./util');
const Client = require('./socket/client');

class Mailbox extends Base {
  constructor({
    name = `pid#${process.pid}`,
    sockPath = path.join(os.tmpdir(), 'ipc-messenger.sock'),
  } = {}) {
    super();

    assert(!is.nullOrUndefined(name), 'options.name required');

    this.name = name;
    this.autoIncrement = 0;
    this.isReady = false;

    this._client = new Client({ sockPath, name });

    this._bind();
  }

  send({ to, data, oneway = false, timeout = TIMEOUT_TIME }) {
    this.autoIncrement = this.autoIncrement + 1;

    const { name: from } = this;
    const id = generateMailNo(from, this.autoIncrement);
    const payload = { id, from, to, data, oneway };

    const mail = { action: ACTION.SEND, payload, timeout };
    return this._send(mail);
  }

  reply({ id, to, data, timeout = TIMEOUT_TIME }) {
    const mail = {
      action: ACTION.REPLY,
      payload: { id, to, data, isReply: true, from: this.name },
      timeout,
    };

    return this._send(mail);
  }

  broadcast({ data, timeout = TIMEOUT_TIME }) {
    const from = this.name;
    const id = generateMailNo(from, this.autoIncrement);

    const mail = {
      action: ACTION.BROADCAST,
      payload: { id, data, from, oneway: true },
      timeout,
    };

    return this._send(mail);
  }

  _online() {
    const { name: from } = this;
    const id = generateMailNo(from, this.autoIncrement);

    const mail = {
      action: ACTION.ONLINE,
      payload: { id, from, oneway: true },
      timeout: TIMEOUT_TIME,
    };
    this._send(mail);
  }

  _bind() {
    this._client.ready(() => {
      this.isReady = true;
      this._online();
      this.ready(true);
    });
    this._client.on('mail', mail => this._onMailHandler(mail));
  }

  _onMailHandler({ action, payload }) {
    if (action === ACTION.ONLINE) {
      return this.emit('online', payload);
    }

    const { isReply, id } = payload;

    if (isReply) {
      return this.emit(`reply#${id}`, payload);
    }
    return this.emit('request', payload);
  }

  async _send({ action, payload, timeout }) {
    if (this._isReady) {
      await new Promise((resolve, reject) => {
        const cancelFlag = setTimeout(function () {
          return reject(new Error(`${this.name} ready error`));
        }, 5000);

        this.ready(() => {
          clearTimeout(cancelFlag);
          return resolve();
        });
      })
    }

    const { id, oneway, isReply, to, from } = payload;

    this._client.send({ action, payload });

    if (oneway || isReply) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const replyId = `reply#${id}`;

      const timeoutFlag = setTimeout(() => {
        this.removeListener(replyId, replyFn);
        const error = new Error();
        error.name = 'ipc-messenger timeout';
        error.message = `${from} to ${to} timeout mail id = ${id}`;

        return reject(error);
      }, timeout);

      this.once(`reply#${id}`, replyFn);
      function replyFn(reply) {
        clearTimeout(timeoutFlag);
        return resolve(reply);
      }
    });
  }

  close() {
    this._client.close();
  }
}

module.exports = Mailbox;
