let HOST = '192.168.27.45'
// HOST = '10.0.0.105'
// HOST = '192.168.27.111'
// HOST = '192.168.27.164'
// HOST = '192.168.27.78'
// HOST = '10.0.0.114'

HOST = '192.168.27.172'
// HOST = '192.168.27.170'
HOST = '192.168.27.138'


const PORT = 8883

let forward = { a1: 0, a2: 1, b1: 1, b2: 0, duration: 200 }
let backward = { a1: 1, a2: 0, b1: 0, b2: 1, duration: 200 }
let right = { a1: 0, a2: 1, b1: 0, b2: 1, duration: 200 }
let left = { a1: 1, a2: 0, b1: 1, b2: 0, duration: 200 }

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
