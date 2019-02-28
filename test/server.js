const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const app = express()
const bodyParser = require('body-parser')
const dgram = require('dgram')
const { PythonShell } = require('python-shell')


app.use(bodyParser.json())
app.use('/', express.static(__dirname))
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'))
})

const server = http.Server(app)
server.listen(8080, () => {
  console.log('listening 8080')
})

/*
const shell = new PythonShell('./camera.py', {
  mode: 'text'
})
*/

const io = socketio(server)
io.on('connection', (socket) => {
  console.log('socket connected')

  /*
  shell.on('message', data => {
    socket.emit('message', data)
  })
  shell.end()
  */

  socket.on('move', (data) => {
    console.log(data)
    const client = dgram.createSocket('udp4')
    let forward = { a1: 0, a2: 1, b1: 1, b2: 0, duration: 200 }
    let backward = { a1: 1, a2: 0, b1: 0, b2: 1, duration: 200 }
    let right = { a1: 0, a2: 1, b1: 0, b2: 1, duration: 200 }
    let left = { a1: 1, a2: 0, b1: 1, b2: 0, duration: 200 }
    let json = JSON.parse(data)
    let ip = json.ip
    let dir = json.dir
    let command
    switch (dir) {
      case 'forward':
        command = forward
        break
      case 'backward':
        command = backward
        break
      case 'left':
        command = left
        break
      case 'right':
        command = right
        break
    }
    let str = JSON.stringify(command)
    let message = Buffer.from(str)
    let port = 8883
    client.send(message, 0, message.length, port, ip, function(err, bytes) {
      if (err) throw err
      client.close()
    })
  })

  socket.on('actuate', (data) => {
    console.log(data)
    const client = dgram.createSocket('udp4')
    let json = JSON.parse(data)
    let ip = json.ip
    let pos = json.pos
    let command = { pos: pos }
    let str = JSON.stringify(command)
    let message = Buffer.from(str)
    let port = 8883
    client.send(message, 0, message.length, port, ip, function(err, bytes) {
      if (err) throw err
      client.close()
    })
  })

})