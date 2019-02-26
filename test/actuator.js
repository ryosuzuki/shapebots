const keypress = require('keypress')
const dgram = require('dgram')
const readline = require('readline')

let HOST = '192.168.27.45'
// HOST = '10.0.0.105'
// HOST = '192.168.27.111'
// HOST = '192.168.27.164'
// HOST = '192.168.27.78'
HOST = '10.0.0.114'
HOST = '192.168.27.138'

const PORT = 8883

console.log('start')
const sendMessage = function(json) {
  const client = dgram.createSocket('udp4')
  let str = JSON.stringify(json)
  let message = Buffer.from(str)
  client.send(message, 0, message.length, PORT, HOST, (err, bytes) => {
    if (err) throw err
    client.close()
  })
}

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.on('line', (line) => {
  let pos = parseInt(line)
  if (pos === NaN) {
    console.log('enter int value')
  } else {
    console.log('move to ' + pos)
    sendMessage({ pos: pos })
  }
});
