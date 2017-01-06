'use strict';

const net = require('net');
const fs = require('fs');
const SDKBase = require('sdk-base');
const is = require('is-type-of');
const debug = require('debug')('socket-msessenger:server');

const Connecter = require('./connecter');
const { ACTION } = require('../constant');

class Server extends SDKBase {
  constructor() {
    super();

    this.connecterMap = new Map();

    this.server = net.createServer(socket => this.init(socket));
  }

  init(socket) {
    if (process.platform !== 'win32') {
      fs.chmodSync(this.sockPath, '775');
    }

    const connecter = new Connecter(socket);
    connecter.init();

    connecter.once('data', ({ action, payload }) => {
      const { name } = payload;

      if (action !== ACTION.REGISTER || !is.string(name)) {
        connecter.close();
        return;
      }

      connecter.hasReady = true;
      connecter.replyRegister();
      connecter.on('data', data => this.dataHandler(data));
      connecter.on('error', error => this.emit('error', error));

      this.connecterMap.set(name, connecter);
    });
  }

  dataHandler({ action, payload }) {
    if (action === ACTION.SEND_MAIL) {
      const { mail } = payload;
      // TODO: 发送邮件
      this.emit('mail', mail);
    }
  }

  getConnecterMap() {
    return this.connecterMap;
  }

  send(mail) {
    const { to } = mail;
    const reg = new RegExp(to);

    const matchList = Array.from(this.connecterMap.keys())
        .filter(name => reg.test(name));

    if (!is.array(matchList) || matchList.length <= 0) {
      // const hasReady = Array.from(this.connecterMap.values())
      //     .findIndex(connecter => connecter.hasReady === false);
      //
      // if (hasReady !== -1) {
      //   setImmediate(this.send.bind(this), mail);
      // }
      return;
    }
    matchList.forEach(name => {
      const connecter = this.connecterMap.get(name);
      connecter.send(mail);
    });

    return;
  }

  listen(sockPath) {
    if (fs.existsSync(sockPath)) {
      fs.unlinkSync(sockPath);
    }
    this.sockPath = sockPath;
    return new Promise(resolve => this.server.listen(sockPath, resolve));
  }

  close() {
    this.server.close();
  }
}

module.exports = Server;
