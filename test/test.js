let ips = {
  1: '128.138.221.148',
  2: '128.138.221.150',
  3: '128.138.221.118',
  4: '128.138.221.155',
  5: '128.138.221.113',
  6: '128.138.221.177',
  7: '128.138.221.147',
  8: '128.138.221.212',
  9: '128.138.221.156',
  10: '128.138.221.102'
}

let id = 1
let val = 100

console.log('start')
const sendCommand = function(json) {
  const dgram = require('dgram')
  const client = dgram.createSocket('udp4')
  let str = JSON.stringify(json)
  let message = Buffer.from(str)
  let port = 8883
  let ip = ips[id]
  client.send(message, 0, message.length, port, ip, function(err, bytes) {
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
      let up = { a1: 0, a2: val, b1: val, b2: 0 }
      sendCommand(up)
      break
    case 'down':
      let stop = { a1: 0, a2: 0, b1: 0, b2: 0 }
      sendCommand(stop)
      break
    case 'left':
      let left = { a1: val, a2: 0, b1: val, b2: 0 }
      sendCommand(left)
      break
    case 'right':
      let right = { a1: 0, a2: val+30, b1: 0, b2: val+30 }
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
