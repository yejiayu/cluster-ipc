
'use strict';

const net = require('net');
const fs = require('fs');
const SDKBase = require('sdk-base');
const is = require('is-type-of');
const debug = require('debug')('socket-msessenger:server');

const Connecter = require('./connecter');
const { ACTION } = require('../constant');

class Server extends SDKBase {
  constructor({ sockPath }) {
    super();

    this._sockPath = sockPath;
    this.connecterMap = new Map();

    this.server = net.createServer(socket => this._connectHandler(socket));
    this._listen();
  }

  _connectHandler(socket) {
    if (process.platform !== 'win32') {
      fs.chmodSync(this._sockPath, '775');
    }

    const connecter = new Connecter(socket);

    connecter.once('data', ({ action, payload }) => {
      const { name } = payload;

      if (action !== ACTION.REGISTER || !is.string(name)) {
        connecter.close();
        return;
      }

      connecter.hasReady = true;
      connecter.replyRegister();
      this.emit('connect', { name, connecter });
      connecter.on('data', data => this.emit('mail', data));
      connecter.on('error', error => this.emit('error', error));

      this.connecterMap.set(name, connecter);
    });
  }

  _listen() {
    const { _sockPath } = this;
    if (fs.existsSync(_sockPath)) {
      fs.unlinkSync(_sockPath);
    }

    this.server.listen(_sockPath, () => this.ready(true));
  }

  close() {
    this.server.close();
  }
}

module.exports = Server;
