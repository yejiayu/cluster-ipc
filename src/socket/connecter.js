'use strict';

const debug = require('debug')('socket-msessenger:connecter');
const EventEmitter = require('events');

const { ACTION } = require('../constant');
const { encode, decode } = require('../util');
const DataEvent = require('./data_event');

class Connecter extends EventEmitter {
  constructor(socket) {
    super();

    this.socket = socket;
    this.hasReady = false;

    this._init();
  }

  _init() {
    this.dataEvent = new DataEvent(this.socket);

    this.dataEvent.on('dataComplete', data => this.emit('data', data));
    this.socket.on('close', err => this.emit('close', err));
    this.socket.on('error', err => this.emit('error', err));
  }

  replyRegister() {
    const data = {
      action: ACTION.REGISTER,
      payload: { ready: true },
    };
    return this.socket.write(encode(data));
  }

  send(data) {
    this.socket.write(encode(data));
  }

  close() {
    this.socket.removeAllListeners();
    this.dataEvent.removeAllListeners();
  }
}

module.exports = Connecter;
