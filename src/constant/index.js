'use strict';

const os = require('os');
const path = require('path');

module.exports = {
  SOCK_PATH: path.join(os.tmpdir(), 'midway.sock'),

  TIMEOUT_TIME: 1000 * 10,

  ACTION: {
    REGISTER: 'REGISTER',
    SEND_MAIL: 'SEND_MAIL',
    REPLY_MAIL: 'reply_mail',
  },
};
