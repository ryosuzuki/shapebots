let max = 5000
let ip = process.argv[2]
console.log(ip)
const keypress = require('keypress')
const dgram = require('dgram')
const readline = require('readline')

console.log('start')
const sendMessage = function(json) {
  const client = dgram.createSocket('udp4')
  let str = JSON.stringify(json)
  let message = Buffer.from(str)
  let port = 8883
  client.send(message, 0, message.length, port, ip, (err, bytes) => {
    if (err) throw err
    client.close()
  })
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.on('line', (line) => {
  let pos = parseInt(line)
  if (isNaN(pos)) {
    if (line === 'init_1') {
      console.log('initialize 1')
      sendMessage({ init_1: 1 })
    } else if (line === 'init_2') {
      console.log('initialize 2')
      sendMessage({ init_2: 1 })
    } else {
      console.log('enter int value')
    }
  } else if (pos === 0) {
    console.log('reset')
    sendMessage({ reset_1: 1, reset_2: 1 })
  } else if (pos > max) {
    console.log('exceed max')
  } else {
    console.log('move to ' + pos)
    sendMessage({ pos_1: pos, pos_2: pos })
  }
})
