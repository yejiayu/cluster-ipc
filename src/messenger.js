'use strict';

const os = require('os');
const path = require('path');
const SDKBase = require('sdk-base');
const assert = require('assert');
const debug = require('debug')('socket-msessenger:messenger');

const Server = require('./socket/server');

const BIND = Symbol('bind_handler');

class Messenger extends SDKBase {
  constructor({ sockPath = path.join(os.tmpdir(), 'midway.sock') } = {}) {
    super();
    this.server = new Server();
    this.sockPath = sockPath;
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
    this.server.send(mail);
  }

  close() {
    this.server.close();
  }
}

module.exports = Messenger;
