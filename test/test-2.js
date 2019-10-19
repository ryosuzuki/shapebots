let ip = process.argv[2]
console.log(ip)

const sendCommand = function(json) {
  const dgram = require('dgram')
  const client = dgram.createSocket('udp4')
  let str = JSON.stringify(json)
  let message = Buffer.from(str)
  let port = 8883
  client.send(message, 0, message.length, port, ip, function(err, bytes) {
    if (err) throw err
    client.close()
  })
}

const keypress = require('keypress')
let val = 300

keypress(process.stdin)

process.stdin.on('keypress', function (ch, key) {
  console.log(key.name)

  switch (key.name) {
    case 'up':
      let forward = { a1: 0, a2: val, b1: val, b2: 0 }
      sendCommand(forward)
      break
    case 'down':
      let backward = { a1: val, a2: 0, b1: 0, b2: val }
      sendCommand(backward)
      break
    case 'space':
      let stop = { a1: 0, a2: 0, b1: 0, b2: 0 }
      sendCommand(stop)
      break
    case 'left':
      let left = { a1: val, a2: 0, b1: val, b2: 0 }
      sendCommand(left)
      break
    case 'right':
      let right = { a1: 0, a2: val, b1: 0, b2: val }
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
