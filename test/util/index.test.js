'use strict';

require('should');
const debug = require('debug')('socket-msessenger:test:util');

const util = require('../../src/util');

describe('test/util/index.test.js', () => {
  it('should decode eq object', done => {
    const object = {
      action: 'SEND_MAIL',
      mail: {
        id: 'client_2#2',
        to: 'client_1',
        from: 'client_2',
        message: 'hello',
        isReply: true,
      },
      name: 'yejiayu',
      age: 24,
    };

    const encodeData = util.encode(object);
    const decodeData = util.decode(encodeData);
    JSON.stringify(decodeData).should.equal(JSON.stringify(object));
    done();
  });
});
