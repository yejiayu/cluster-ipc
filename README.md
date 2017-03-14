# ipc-messager
> A Node IPC module base on Unix socket

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
> To be perfect
