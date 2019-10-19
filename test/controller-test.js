// 13, 14, 21, 8
let ip = process.argv[2]
console.log(ip)

const sendCommand = function(command) {
  const dgram = require('dgram')
  const client = dgram.createSocket('udp4')
  let message = Buffer.from(command)
  let port = 893
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
  let command = '11111111'
  switch (key.name) {
    case 'up':
      command = '01111111'
      break
    case 'down':
      command = '10111111'
      break
    case 'space':
      command = '11111111'
      break
    case 'left':
      command = '11011111'
      break
    case 'right':
      command = '11101111'
      break
    case 'u':
      command = '11110111'
      break
    case 'd':
      command = '11111011'
      break
    case 'q':
      command = '11111101'
      break
    case 'w':
      command = '11111110'
      break
    default:
      console.log('press arrow key')
  }
  console.log(command)
  sendCommand(command)
  if (key && key.ctrl && key.name == 'c') {
    process.stdin.pause();
  }
})

process.stdin.setRawMode(true)
process.stdin.resume()
