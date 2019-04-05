let ips = {
  1: '128.138.221.150',
  2: '128.138.221.148',
  3: '128.138.221.118',
  4: '128.138.221.155',
  5: '128.138.221.113',
  6: '128.138.221.177',
  7: '128.138.221.147',
  // 8: '128.138.221.212',
  9: '128.138.221.156',
  10: '128.138.221.102',
  12: '128.138.221.212',
}

let id = 6
let max = 5000

const keypress = require('keypress')
const dgram = require('dgram')
const readline = require('readline')

console.log('start')
const sendMessage = function(json) {
  const client = dgram.createSocket('udp4')
  let str = JSON.stringify(json)
  let message = Buffer.from(str)
  let port = 8883
  let ip = ips[id]
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
  if (line === 'init_all') {
    console.log('init_all')
    sendMessage({ init_all: 1 })
  }
  if (line === 'init_1') {
    console.log('init_1')
    sendMessage({ init_1: 1 })
  }
  if (line === 'init_2') {
    console.log('init_2')
    sendMessage({ init_2: 1 })
  }

  if (line === 'a') {
    sendMessage({ pos_1: 2000, pos_2: 3000 })
  }
  if (line === 's') {
    sendMessage({ pos_1: 2000, pos_2: 2400 })
  }


  // let pos = parseInt(line)
  // if (pos === NaN) {
  //   console.log('enter int value')
  // } else if (pos === 0) {
  //   console.log('reset')
  //   sendMessage({ reset_1: 1, reset_2: 1 })
  // } else if (pos > max) {
  //   console.log('exceed max')
  // } else {
  //   console.log('move to ' + pos)
  //   let pos_1 = pos // Math.min(0, pos-1000)
  //   let pos_2 = pos
  //   sendMessage({ pos_1: pos_1, pos_2: pos_2 })
  // }
})


/*
const server = dgram.createSocket('udp4')
server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});
server.on('message', (msg, rinfo) => {
  console.log(msg)
});
server.bind(8884, '0.0.0.0')
*/
