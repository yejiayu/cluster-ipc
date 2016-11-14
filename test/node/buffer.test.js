'use strict';

require('should');
const debug = require('debug')('socket-msessenger:test:node:buffer');

describe('test/node/buffer.test.js', () => {
  it('should str length eq decodeStr length', done => {
    const buffer = Buffer.alloc(30);
    const reChinese = /([\u4e00-\u9fa5])+/;

    const str = '一二三23四五12六七八九十';
    const bodyLength = str.split('').reduce((pre, cur) => {
      return reChinese.test(cur) ? pre + 3 : pre + 1;
    }, 0);
    debug(bodyLength);
    buffer.write(str);

    debug(buffer.toString());
    done();
  });
});
