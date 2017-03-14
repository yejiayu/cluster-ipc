'use strict';

const is = require('is-type-of');

const INT_32_LENGTH = 4;

const util = {
  encode(data) {
    let parsedData = '';
    if (!is.string(data)) {
      parsedData = JSON.stringify(data);
    } else {
      parsedData = data;
    }

    const bodyLength = util.getBodyLength(parsedData);
    const resultData = Buffer.alloc(INT_32_LENGTH + bodyLength);

    resultData.writeInt32BE(bodyLength, 0);
    resultData.write(parsedData, INT_32_LENGTH);

    return resultData;
  },

  getBodyLength(str) {
    return Buffer.from(str).length;
  },

  generateMailNo(prefix, NO) {
    return `${prefix}#${NO}`;
  },
};

module.exports = util;
