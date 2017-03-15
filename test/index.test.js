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
  const box2 = new Mailbox({ sockPath, name: 'box2' });

  t.context.messenger = messenger;
  t.context.box1 = box1;
  t.context.box2 = box2;
});

test.cb('child_process to child_process', (t) => {
  const { box1, box2, messenger } = t.context;

  box2.on('request', (payload) => {
    const { id, from: to, data } = payload;
    t.is(data, 'hello world');
    box2.reply({ id, to, data: { message: 'ok hello world'} })
  })

  box1.on('online', async ({ from }) => {
    if (from === 'box2') {
      const reply = await box1.send({
        to: 'box2',
        data: 'hello world',
      })

      const { from, to, data } = reply;
      t.is(from, 'box2');
      t.is(to, 'box1');
      t.is(data.message, 'ok hello world');
      t.end()
    }
  })
})

test.cb('child_process to child_process timeout', (t) => {
  const { box1 } = t.context;

  box1.on('online', (payload) => {
    if (payload.from === 'box2') {
      box1.send({
        to: 'box2',
        data: 'hello world',
        timeout: 2000,
      }).catch(e => {
        t.is(e.name, 'ipc-messenger timeout');
        t.end();
      })
    }
  })
})

test.cb('broadcast', (t) => {
  const { box1, box2 } = t.context;
  !(async function () {
    await new Promise((resolve) => {
      box1.ready(resolve)
    });
    await new Promise((resolve) => {
      box2.ready(resolve)
    })

    box1.broadcast({
      data: { message: '这是一个广播' }
    })

    box2.on('request', (payload) => {
      t.is(payload.from, 'box1');
      t.end();
    })
  })()
})

test.cb('online', (t) => {
  const { box1, } = t.context;

  box1.on('online', payload => {
    t.is(payload.from, 'box2');
    t.end()
  })
})
