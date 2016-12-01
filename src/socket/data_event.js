'use strict';

const EventEmitter = require('events');
const debug = require('debug')('socket-msessenger:data_event');
const ExBuffer = require('ExBuffer');

const exBuffer = new ExBuffer().uint32Head().bigEndian();
const INNER_TEMP_DATA = Symbol('INNER_TEMP_DATA');

class DataEvent extends EventEmitter {
  constructor(socket) {
    super();

    this.socket = socket;

    this[INNER_TEMP_DATA] = null;

    this.socket.on('data', data => this.dataHandler(data));
    exBuffer.on('data', completeData => this.emit('dataComplete', JSON.parse(completeData)));
  }

  dataHandler(data) {
    exBuffer.put(data);
  }
}

module.exports = DataEvent;
