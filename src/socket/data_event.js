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
    debug(data.toString());
    if (is.nullOrUndefined(this[INNER_TEMP_DATA])) {
      this[INNER_TEMP_DATA] = data;
    } else {
      this[INNER_TEMP_DATA] = Buffer
          .concat([this[INNER_TEMP_DATA], data], this[INNER_TEMP_DATA].length + data.length);
    }

    const { completeData, modData } = getCompleteData(data);

    if (is.buffer(completeData)) {
      this.emit('dataComplete', completeData);
    }

    if (is.buffer(modData)) {
      this[INNER_TEMP_DATA] = modData;
    }
  }
}

module.exports = DataEvent;
