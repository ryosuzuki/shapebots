let ips = {
  1: '128.138.221.150',
  2: '128.138.221.148',
  3: '128.138.221.118',
  4: '128.138.221.155',
  5: '128.138.221.113',
  6: '128.138.221.177',
  7: '128.138.221.147',
  8: '128.138.221.212',
  9: '128.138.221.156',
  10: '128.138.221.102'
}

let ids = [2, 3, 5, 7]
let val = 400

console.log('start')
const sendCommand = function(json) {
  const dgram = require('dgram')
  let str = JSON.stringify(json)
  let message = Buffer.from(str)
  let port = 8883
  for (let id of ids) {
  let ip = ips[id]
    const client = dgram.createSocket('udp4')
    client.send(message, 0, message.length, port, ip, function(err, bytes) {
      if (err) throw err
      client.close()
    })
  }
}

const keypress = require('keypress')
keypress(process.stdin)

process.stdin.on('keypress', function (ch, key) {
  console.log(key.name)
  switch (key.name) {
    case 'up':
      let up = { a1: 0, a2: val, b1: val, b2: 0 }
      sendCommand(up)
      break
    case 'right':
      let extend = { pos_1: 2000, pos_2: 2000 }
      sendCommand(extend)
      break
    case 'down':
      let stop = { a1: 0, a2: 0, b1: 0, b2: 0 }
      sendCommand(stop)
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
