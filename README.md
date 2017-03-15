# cluster-ipc
> A Node IPC module base on Unix socket

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![David deps][david-image]][david-url]
[![node version][node-image]][node-url]
[![npm download][download-image]][download-url]
[![npm license][license-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/cluster-ipc.svg?style=flat-square
[npm-url]: https://npmjs.org/package/cluster-ipc
[travis-image]: https://img.shields.io/travis/yejiayu/cluster-ipc.svg?style=flat-square
[travis-url]: https://travis-ci.org/yejiayu/cluster-ipc
[coveralls-image]: https://img.shields.io/coveralls/yejiayu/cluster-ipc.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/yejiayu/cluster-ipc?branch=master
[david-image]: https://img.shields.io/david/yejiayu/cluster-ipc.svg?style=flat-square
[david-url]: https://david-dm.org/yejiayu/cluster-ipc
[node-image]: https://img.shields.io/badge/node.js-%3E=_4.6.1-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[download-image]: https://img.shields.io/npm/dm/cluster-ipc.svg?style=flat-square
[download-url]: https://npmjs.org/package/cluster-ipc
[license-image]: https://img.shields.io/npm/l/cluster-ipc.svg

## Example

### cluster mode
```js
'use strict'

const cluster = require('cluster')
const os = require('os');
const path = require('path');
const Messenger = require('ipc-messenger').Messenger
const Mailbox = require('ipc-messenger').Mailbox

const sockPath = path.join(os.tmpdir(), 'ipc-messenger.sock')

if (cluster.isMaster) {
  !(async function setup() {
    const messenger = new Messenger({ sockPath })
    await messenger.init()

    const masterBox = new Mailbox({ name: 'master' })

    masterBox.send({
      to: 'worker2',
      data: 'hello',
    })

    for (let i = 1; i < 5; i++) {
      cluster.fork({
        env: { BOX_ID: i }
      })
    }
  })().catch(console.error)  
} else {
  const workerBox = new Mailbox({ name: `worker${process.env.BOX_ID}`})
  workerBox.on('request', mail => {
    const { to, data, from } = mail

    console.log(to) // 'worker2'
    console.log(from) // 'master'
    console.log(data) // 'hello'
  })
}
```

## API
### Method
#### send
> send message to another box

```js
const reply = await box1.send({
  to: 'box2', // required, target box name support RegExp.
  data: { action: 'getPid' }, // optional, custom message.
  oneway: false, // optional, no reply? default false.
  timeout: 5000, // optional, request timeout, default 5000
})

console.log(reply); // { id: 1, from: 'box2', to: 'box1', isReply: true, data: { pid: 123 } };
```

#### reply
> reply message to sender

```js
box2.reply({
  id: 1, // mail id
  to: 'box1',
  data: { pid: 123 },
})
```

#### broadcast
> send message to another boxes

```js
box1.broadcast({
  data: 'hi, all',
})
```

### event
#### request
```js
box1.on('request', payload => {
  console.log(payload); // { id: 1, from: 'box2', to: 'box1', data: { 'my box2' } }
})
```
#### online
> other box online event

```js
box1.on('online', payload => {
  console.log(payload); // { id: 1, from: 'box2' }
})
```

> To be perfect
