const cv = require('opencv');
const _ = require('lodash')

const config = require('./config')
const connect = require('./connect')
const detectRect = require('./rect')
const detectRobots = require('./robots')
const detectMarkers = require('./markers')
const detectConstraint = require('./constraint')
const detectPointer = require('./pointer')
const detectPanel = require('./panel')
const detectPanelMarker = require('./panel-marker')
const warpWithRect = require('./warp')

class Track {
  constructor() {
    for (let key of Object.keys(config)) {
      this[key]= config[key]
    }
    this.ready = false
    this.arduinoUse = false
    this.arduinoReady = false
    this.arduinoRunning = false
    this.timerFinish = true
    this.cameraInterval = 200 // 1000 / this.camFps
    this.rect = []
    this.panel = []
    this.positions = []
    this.constraints = []
    this.init()
  }

  init() {
    this.camera = new cv.VideoCapture(1)
    this.camera.setWidth(this.camWidth)
    this.camera.setHeight(this.camHeight)
    // this.connect = connect.bind(this)
    this.detectRect = detectRect.bind(this)
    this.detectRobots = detectRobots.bind(this)
    this.detectMarkers = detectMarkers.bind(this)
    this.detectConstraint = detectConstraint.bind(this)
    this.detectPointer = detectPointer.bind(this)
    this.detectPanel = detectPanel.bind(this)
    this.detectPanelMarker = detectPanelMarker.bind(this)
    this.warpWithRect = warpWithRect.bind(this)
  }

  run() {
    setInterval(() => {
      this.camera.read((err, im) => {
        if (err) throw err
        this.im = im.copy()
        this.imPanel = im.copy()

        // this.detectRect()
        this.detectRobots()
        this.detectMarkers()
        this.computeAngles()
        /*
        if (this.ready) {
          this.warpWithRect('rect')
          this.detectPointer()
          this.detectMarker()
          this.detectConstraint()
        }

        this.detectPanel()
        if (this.panelReady) {
          this.warpWithRect('panel')
          this.detectPanelMarker()
        }
        */

        this.buffer = this.im.toBuffer()
        this.bufferPanel = this.imPanel.toBuffer()
        this.socket.emit('buffer', {
          buffer: this.buffer,
          bufferPanel: this.bufferPanel,
          rect: this.rect,
          panel: this.panel,
        })

        // window.blockingWaitKey(0, 50)

      })
    }, this.cameraInterval)
  }

  computeAngles() {
    let i = 0
    for (let robot of this.robots) {
      let pos = robot.pos
      let angle = robot.angle
      let marker = this.markers[i]

      try {
        let cx = pos.x
        let cy = pos.y
        let mx = marker.x
        let my = marker.y

        let dx = mx - cx
        let dy = my - cy

        const offset = 45 // initial angle when marker is upper left
        let newAngle
        if(dx<0&&dy<0){
          //marker is upper left
          // angle = Math.atan2(Math.abs(dy), Math.abs(dx)) * 180 / Math.PI - offset
          newAngle = angle + 0
        } else if (dx<0&&dy>0){
          //marker is lower left
          // angle = Math.atan2(Math.abs(dy), Math.abs(dx)) * 180 / Math.PI + 90 - offset
          newAngle = angle - 90
        } else if (dx>0&&dy>0){
          //marker is lower right
          // angle = Math.atan2(Math.abs(dy), Math.abs(dx)) * 180 / Math.PI + 180 - offset
          newAngle = angle - 180
        } else if(dx>0&&dy<0){
          //marker is upper right
          // angle = Math.atan2(Math.abs(dy), Math.abs(dx)) * 180 / Math.PI + 270 - offset
          newAngle = angle - 270
        }

        // let angle = Math.atan2(dx, dy) * 180 / Math.PI
        // var theta = Math.atan2(dy, dx); // range (-PI, PI]
        // theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
        // if (angle < 0) angle = 360 + angle // range [0, 360)
        robot.newAngle = newAngle
        // this.angles.push(angle)

        this.robots[i] = robot
        i++
      }
      catch(err) {
      }
    }

    this.socket.emit('robots:update', this.robots)
    // this.socket.emit('angles:update', this.angles)
  }

  start(socket) {
    let connected = this.socket ? true : false
    this.socket = socket
    this.socket.on('update:pos', this.updatePos.bind(this))
    this.socket.on('send:command', this.sendCommand.bind(this))
    if (!connected) {
      console.log('connect')
      // this.connect()
      this.run()
    } else {
      console.log('already connected')
    }
  }

  sendCommand(json) {

    const HOST = '192.168.1.97'
    const PORT = 8883
    const dgram = require('dgram')
    const client = dgram.createSocket('udp4')

    // type is 1: forward, 2: backward, 3: clockwise, 4: counterclockwise
    // duration is delay time of the above command
    // e.g.) json = { type: 1, duration: 400 }
    console.log('hoge')
    let str = JSON.stringify(json)
    let message = new Buffer(str)
    client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
      if (err) throw err
      console.log('sent')
      client.close()
    })
  }

  updatePos(data) {
    let id = data.id
    let pos = data.pos
    this.positions[id] = pos
  }

  random() {
    return Math.floor(Math.random()*40)
  }


}

module.exports = Track
