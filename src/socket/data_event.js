'use strict';

const EventEmitter = require('events');
const is = require('is-type-of');
const debug = require('debug')('socket-msessenger:data_event');

const { getCompleteData } = require('../util');

const INNER_TEMP_DATA = Symbol('INNER_TEMP_DATA');

class DataEvent extends EventEmitter {
  constructor(socket) {
    super();

    this.socket = socket;

    this[INNER_TEMP_DATA] = null;

    this.socket.on('data', data => this.dataHandler(data));
  }

  dataHandler(data) {
    if (!this[INNER_TEMP_DATA]) {
      this[INNER_TEMP_DATA] = data;
    }

    const { completeData, modData } = getCompleteData(data);

    if (is.buffer(completeData)) {
      this.emit('dataComplete', completeData);
    } else {
      this[INNER_TEMP_DATA] = Buffer
          .concat([this[INNER_TEMP_DATA], data], this[INNER_TEMP_DATA].length + data.length);
    }

    if (is.buffer(modData)) {
      this.dataHandler(modData);
    }
  }
}

module.exports = DataEvent;
