const cv = require('opencv');
const _ = require('lodash')

const config = require('./config')
const connect = require('./connect')
const detectRect = require('./rect')
const detectRobots = require('./robots')
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
    this.connect = connect.bind(this)
    this.detectRect = detectRect.bind(this)
    this.detectRobots = detectRobots.bind(this)
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

  start(socket) {
    let connected = this.socket ? true : false
    this.socket = socket
    this.socket.on('update:pos', this.updatePos.bind(this))
    if (!connected) {
      console.log('connect')
      // this.connect()
      this.run()
    } else {
      console.log('already connected')
    }
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

