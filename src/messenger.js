'use strict';

const os = require('os');
const path = require('path');
const SDKBase = require('sdk-base');
const assert = require('assert');
const debug = require('debug')('socket-msessenger:messenger');

const Server = require('./socket/server');

const BIND = Symbol('bind_handler');

class Messenger extends SDKBase {
  constructor() {
    super();
    this.server = new Server();
    this.sockPath = path.join(os.tmpdir(), 'midway.sock');
  }

  * init() {
    const { server, sockPath } = this;
    yield server.listen(sockPath);

    this[BIND]();
  }

  [BIND]() {
    this.server.on('mail', mail => this.onMailHandler(mail));
  }

  onMailHandler(mail) {
    // debug(mail);
    const { to, from } = mail;

    const connecterNameList = this.server.getConnecterNameList();

    assert(connecterNameList.findIndex(name => name === to) !== -1, `can not find to ${to}`);
    assert(connecterNameList.findIndex(name => name === from) !== -1, `can not find from ${from}`);

    this.server.send(mail);
  }
}

module.exports = Messenger;
