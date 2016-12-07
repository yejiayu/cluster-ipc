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
  }

  init() {
    this.dataEvent = new DataEvent(this.socket);

    this.dataEvent.on('dataComplete', data => this.emit('data', data));
  }

  replyRegister() {
    return this.socket.write(encode({ ready: true }));
  }

  send(mail) {
    const data = { action: ACTION.SEND_MAIL, mail };
    this.socket.write(encode(data));
  }

  close() {
    this.socket.removeAllListeners();
    this.dataEvent.removeAllListeners();
  }
}

module.exports = Connecter;
