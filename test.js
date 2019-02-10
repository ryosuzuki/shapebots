// const HOST = '192.168.27.45'
const HOST = '10.0.0.105' // '192.168.27.111'
const PORT = 8883

let forward = { a1: 1, a2: 0, b1: 0, b2: 1, duration: 100 }
let backward = { a1: 0, a2: 1, b1: 1, b2: 0, duration: 100 }
let right = { a1: 0, a2: 1, b1: 0, b2: 1, duration: 100 }
let left = { a1: 1, a2: 0, b1: 1, b2: 0, duration: 100 }

console.log('start')
const sendCommand = function(json) {
  const dgram = require('dgram')
  const client = dgram.createSocket('udp4')
  let str = JSON.stringify(json)
  let message = Buffer.from(str)
  client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
    if (err) throw err
    client.close()
  })
}

let commands = ['forward', 'backward', 'left', 'right']

const keypress = require('keypress')

keypress(process.stdin)

process.stdin.on('keypress', function (ch, key) {
  console.log(key.name)
  switch (key.name) {
    case 'up':
      sendCommand(forward)
      break
    case 'down':
      sendCommand(backward)
      break
    case 'left':
      sendCommand(left)
      break
    case 'right':
      sendCommand(right)
      break
    default:
      console.log('press arrow key')
  }
  if (key && key.ctrl && key.name == 'c') {
    process.stdin.pause();
  }
})

process.stdin.setRawMode(true)
process.stdin.resume()
