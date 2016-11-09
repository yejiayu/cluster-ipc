'use strict';

const net = require('net');
const fs = require('fs');
const sdkBase = require('sdk-base');
const is = require('is-type-of');
const debug = require('debug')('socket-msessenger:server');

const { encode, decode } = require('../util');
const { ACTION } = require('../constant');
const DataEvent = require('./data_event');

class Server extends sdkBase {
  constructor() {
    super();

    this.socketMap = new Map();

    this.init();
  }

  init() {
    this.server = net.createServer(socket => this.initClient(socket));
  }

  bind({ name, dataEvent, socket }) {
    socket.on('error', error => this.emit('error', error));
    dataEvent.on('dataComplete', data => this.dataCompleteHandler(data));
    socket.on('close', () => {
      socket.removeAllListeners();
      dataEvent.removeAllListeners();

      this.socketMap.delete(name);
      this.emit('close', name);
    });
  }

  initClient(socket) {
    const dataEvent = new DataEvent(socket);

    dataEvent.once('dataComplete', data => {
      const { action, payload } = decode(data);

      if (action === ACTION.REGISTER) {
        this.register({ payload, dataEvent, socket });
      }
    });
  }

  dataCompleteHandler(data) {
    const { action, mail } = decode(data);

    if (action === ACTION.SEND_MAIL) {
      // TODO: 发送邮件
      this.emit('mail', mail);
    }
  }

  register({ payload, dataEvent, socket }) {
    const { name } = payload;

    this.socketMap.set(name, socket);
    this.bind({ name, dataEvent, socket });

    const success = encode({ ready: true });
    return socket.write(success);
  }

  getClientNameList() {
    return Array.from(this.socketMap.keys());
  }

  send(mail) {
    const { to } = mail;
    const reg = new RegExp(to);

    const matchList = this.getClientNameList().filter(name => reg.test(name));

    if (!is.array(matchList) || matchList.length <= 0) {
      return false;
    }

    matchList.forEach(name => {
      const socket = this.socketMap.get(name);

      const data = {
        action: ACTION.SEND_MAIL,
        mail,
      };
      socket.write(encode(data));
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
