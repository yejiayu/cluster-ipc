'use strict';

const os = require('os');
const path = require('path');
const SDKBase = require('sdk-base');
const is = require('is-type-of');
const debug = require('debug')('socket-msessenger:messenger');

const Server = require('./socket/server');
const { ACTION } = require('./constant');

class Messenger extends SDKBase {
  constructor({ sockPath = path.join(os.tmpdir(), 'ipc-messenger.sock') } = {}) {
    super();
    this._server = new Server({ sockPath });

    this._connectersMap = new Map();
  }

  init(cb) {
    const { _server } = this;

    _server.ready(() => this.ready(true));

    this._bind();

    if (is.function(cb)) {
      return this.ready(cb);
    }

    return new Promise((resolve, reject) => {
      const cancel = setTimeout(() => {
        reject(new Error('messenger ready timeout'));
      }, 5000);
      this.ready(() => {
        clearTimeout(cancel);
        return resolve();
      });
    });
  }

  _bind() {
    this._server.on('mail', mail => this._onMailHandler(mail));
  }

  _onMailHandler({ action, payload }) {
    switch (action) {
      case ACTION.SEND:
      case ACTION.REPLY:
        this._sendAssignMailbox({ action, payload });
        break;
      case ACTION.BROADCAST:
      case ACTION.ONLINE:
        this._sendBroadcast({ action, payload });
        break;
    }
  }

  _sendAssignMailbox({ action, payload }) {
    const { _server } = this;
    const { to } = payload;
    const reg = new RegExp(to);

    try {
      if (is.nullOrUndefined(to)) {
        throw new Error('mail.to is required');
      }

      const matchList = Array.from(_server.connecterMap.keys())
          .filter(name => reg.test(name));

      if (!is.array(matchList) || matchList.length <= 0) {
        throw new Error(`not find ${to} client`);
      }

      matchList.forEach(name => {
        const connecter = _server.connecterMap.get(name);
        connecter.send({ action, payload });
      });
    } catch (e) {
      console.error(e);
    }
  }

  _sendBroadcast({ action, payload }) {
    const { _server } = this;
    const { from } = payload;

    for (const [name, connecter] of _server.connecterMap) {
      // 不发送广播给自己
      if (name !== from) {
        connecter.send({ action, payload });
      }
    }
  }

  close() {
    this._server.close();
  }
}

module.exports = Messenger;
