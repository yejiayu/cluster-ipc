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
  constructor({ sockPath, name }) {
    super();

    assert(is.string(name) && name.length > 0, 'options.name required');

    this._socket = net.connect(sockPath);
    this.name = name;
    this.isReady = false;

    this.init();
  }

  init() {
    this.dataEvent = new DataEvent(this._socket, this.name);
    this[BIND]();

    this.register();
  }

  [BIND]() {
    this.dataEvent.on('dataComplete', data => this.dataCompleteHandler(data));
  }

  dataCompleteHandler(completeData) {
    const decodeData = completeData;

    if (this.isReady) {
      const { action, payload } = decodeData;
      this.emit('mail', { action, payload });
    } else {
      const { payload } = decodeData;

      if (payload.ready) {
        this.ready(true);
        this.isReady = true;
      } else {
        this.emit('error', new Error(`${this.name} register fail`));
      }
    }
  }

  send(data) {
    this._socket.write(encode(JSON.stringify(data)));
  }

  register() {
    const data = { action: ACTION.REGISTER, payload: { name: this.name } };

    this._socket.write(encode(JSON.stringify(data)));
  }

  close() {
    this._socket.destroy();
  }
}

module.exports = Client;
