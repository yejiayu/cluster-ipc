'use strict';

const net = require('net');
const fs = require('fs');
const sdkBase = require('sdk-base');
const is = require('is-type-of');
const debug = require('debug')('socket-msessenger:server');

const Connecter = require('./connecter');
const { ACTION } = require('../constant');

class Server extends sdkBase {
  constructor() {
    super();

    this.connecterMap = new Map();

    this.server = net.createServer(socket => this.init(socket));
  }

  init(socket) {
    const connecter = new Connecter(socket);
    connecter.init();

    connecter.once('data', ({ action, payload }) => {
      const { name } = payload;

      if (action !== ACTION.REGISTER || !is.string(name)) {
        connecter.close();
      }

      connecter.replyRegister();
      connecter.on('data', data => this.dataHandler(data));
      connecter.on('error', error => this.emit('error', error));

      this.connecterMap.set(name, connecter);
    });
  }

  dataHandler({ action, mail }) {
    if (action === ACTION.SEND_MAIL) {
      // TODO: 发送邮件
      this.emit('mail', mail);
    }
  }

  getConnecterNameList() {
    return Array.from(this.connecterMap.keys());
  }

  send(mail) {
    const { to } = mail;
    const reg = new RegExp(to);

    const matchList = this.getConnecterNameList().filter(name => reg.test(name));

    if (!is.array(matchList) || matchList.length <= 0) {
      return false;
    }
    matchList.forEach(name => {
      const connecter = this.connecterMap.get(name);
      connecter.send(mail);
    });

    return true;
  }

  listen(sockPath) {
    if (fs.existsSync(sockPath)) {
      fs.unlinkSync(sockPath);
    }

    return new Promise(resolve => this.server.listen(sockPath, resolve));
  }
}

module.exports = Server;
