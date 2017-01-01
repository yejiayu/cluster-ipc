'use strict';

const assert = require('assert');
const net = require('net');
const is = require('is-type-of');
const SDKBase = require('sdk-base');
const debug = require('debug')('socket-msessenger:client');

const { encode } = require('../util');
const { ACTION } = require('../constant');
const DataEvent = require('./data_event');

const BIND = Symbol('bind_handler');

class Client extends SDKBase {
  constructor({ sockPath, socket, name }) {
    super();

    assert(is.string(name) && name.length > 0, 'options.name required');

    if (is.undefined(socket) && is.string(sockPath)) {
      this.socket = net.connect(sockPath);
    } else if (is.object(socket)) {
      this.socket = socket;
    } else {
      // TODO: error message
      throw new Error();
    }

    this.socket.name = name;
    this.name = name;
    this.hasReady = false;

    this.init();
  }

  init() {
    this.dataEvent = new DataEvent(this.socket, this.name);
    this[BIND]();

    this.register();
  }

  [BIND]() {
    this.dataEvent.on('dataComplete', data => this.dataCompleteHandler(data));
  }

  dataCompleteHandler(completeData) {
    const decodeData = completeData;

    if (this.hasReady) {
      const { mail } = decodeData;
      this.emit('mail', mail);
    } else {
      const { ready } = decodeData;

      if (ready) {
        this.ready(true);
        this.hasReady = true;
      } else {
        this.emit('error', new Error(`${this.name} register fail`));
      }
    }
  }

  send(mail) {
    const data = { action: ACTION.SEND_MAIL, payload: { mail } };
    this.socket.write(encode(JSON.stringify(data)));
  }

  register() {
    const data = { action: ACTION.REGISTER, payload: { name: this.name } };

    this.socket.write(encode(JSON.stringify(data)));
  }

  close() {
    this.socket.destroy();
  }
}

module.exports = Client;
