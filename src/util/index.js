'use strict';

const is = require('is-type-of');
const debug = require('debug')('socket-msessenger:util');

const INT_32_LENGTH = 4;

const util = {
  getLength(data) {
    const limit = data.readInt32BE(0) + INT_32_LENGTH;
    return limit;
  },

  getCompleteData(data) {
    const limit = util.getLength(data);

    if (data.length < limit) {
      return {};
    }

    const completeData = new Buffer(limit);
    data.copy(completeData, 0, 0, limit);

    const modLength = data.length - limit;
    if (modLength > 0) {
      const modData = new Buffer(modLength);
      data.copy(modData, 0, limit + 1);

      return {
        completeData,
        modData,
      };
    }

    return { completeData };
  },

  encode(data) {
    if (!is.string(data)) {
      data = JSON.stringify(data);
    }
    const bodyLength = data.length;

    const resultData = Buffer.alloc(INT_32_LENGTH + bodyLength);
    resultData.writeInt32BE(bodyLength, 0);
    resultData.write(data, INT_32_LENGTH);

    return resultData;
  },

  decode(data) {
    const bodyLength = data.readInt32BE();
    return JSON.parse(data.slice(INT_32_LENGTH, INT_32_LENGTH + bodyLength).toString());
  },

  generateMailNo(prefix, NO) {
    return `${prefix}#${NO}`;
  },
};

module.exports = util;
