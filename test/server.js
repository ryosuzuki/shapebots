const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use('/', express.static(__dirname))
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'))
})

const server = http.Server(app)
server.listen(8080, () => {
  console.log('listening 8080')
})

const io = socketio(server)
io.on('connection', (socket) => {
  console.log('socket connected')

  socket.on('message', (message) => {
    console.log(message)
  })

})