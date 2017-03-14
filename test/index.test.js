'use strict';

const os = require('os');
const path = require('path');
const test = require('ava');
const Messenger = require('../').Messenger;
const Mailbox = require('../').Mailbox;
const { ACTION } = require('../lib/constant');

test.beforeEach(async (t) => {
  const sockPath = path.join(os.tmpdir(), `${Date.now()}.sock`)

  const messenger = new Messenger({ sockPath });
  await messenger.init()

  const box1 = new Mailbox({ sockPath, name: 'box1' });
  await box1.init()
  const box2 = new Mailbox({ sockPath, name: 'box2' });
  await box2.init()

  t.context.messenger = messenger;
  t.context.box1 = box1;
  t.context.box2 = box2;
});

test('child_process to child_process', async (t) => {
  const { box1, box2, messenger } = t.context;

  box2.on('request', (payload) => {
    const { id, from: to, data } = payload;
    t.is(data, 'hello world');
    box2.reply({ id, to, data: { message: 'ok hello world'} })
  })

  const reply = await box1.send({
    to: 'box2',
    data: 'hello world',
  })

  const { from, to, data } = reply;
  t.is(from, 'box2');
  t.is(to, 'box1');
  t.is(data.message, 'ok hello world');
})

test('child_process to child_process timeout', async (t) => {
  const { box1 } = t.context;

  try {
    const { from, to, data } = await box1.send({
      to: 'box2',
      data: 'hello world',
      timeout: 2000,
    })
  } catch (e) {
    t.is(e.name, 'ipc-messenger timeout');
  }
})

test.cb('broadcast', (t) => {
  const { box1, box2 } = t.context;
  box1.broadcast({
    data: { message: '这是一个广播' }
  })


  box2.on('request', (payload) => {
    t.is(payload.from, 'box1');
    t.end();
  })
})

test.cb('online', (t) => {
  const { box1, } = t.context;

  box1.on('online', payload => {
    t.is(payload.from, 'box2');
    t.end()
  })
})
