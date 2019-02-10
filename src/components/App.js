import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from '../redux/actions'
import _ from 'lodash'
import dgram from 'chrome-dgram'

// const socket = io.connect('http://localhost:4000/')
const socket = new WebSocket('ws://127.0.0.1:8080/ws');

import Robot from './Robot'

class App extends Component {
  constructor(props) {
    super(props)
    window.app = this
    this.socket = socket
    this.state = {
      robots: []
    }
    this.socket.onmessage = this.onMessage.bind(this)
  }

  componentDidMount() {
    // this.frameId = requestAnimationFrame(this.animate)
  }

  onMessage(e) {
    let data = JSON.parse(e.data)
    this.updateCamera(data.image)
  }

  updateRobots(robots) {
    console.log('update')
    this.setState({ robots: robots })
  }

  updateCamera(src) {
    const canvas = document.getElementById('canvas')
    const context = canvas.getContext('2d')
    const image = new Image()
    image.src = 'data:image/png;base64,' + src
    image.onload = () => {
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
    }
  }

  sendCommand(ip, command) {
    const port = 8883
    const client = dgram.createSocket('udp4')
    let str = JSON.stringify(command)
    let message = new Buffer(str)
    client.send(message, 0, message.length, port, ip, (err, bytes) => {
      if (err) throw err
      client.close()
    })
  }

  onClick(event) {
    // let type = $('#type').val()
    // let duration = $('#duration').val()
    // let command = { type: parseInt(type), duration: parseInt(duration) }

    let forward = { a1: 1, a2: 0, b1: 0, b2: 1, duration: 100 }
    let backward = { a1: 0, a2: 1, b1: 1, b2: 0, duration: 100 }
    let right = { a1: 0, a2: 1, b1: 0, b2: 1, duration: 100 }
    let left = { a1: 1, a2: 0, b1: 1, b2: 0, duration: 100 }

    let ip = '192.168.27.111'
    let command = forward
    this.sendCommand(ip, command)
  }

  stop() {
    cancelAnimationFrame(this.frameId)
  }

  animate() {
    this.frameId = window.requestAnimationFrame(this.animate)
  }

  updateState(state) {
    this.props.store.dispatch(actions.updateState(state))
  }

  render() {
    return (
      <div>
        <div className="ui buttons">
          <button className="ui button" onClick={this.onClick.bind(this, 'left')}>
            <i className="left chevron icon"></i>
            Left
          </button>
          <button className="ui button" onClick={this.onClick.bind(this, 'backward')}>
            <i className="down chevron icon"></i>
            Down
          </button>
          <button className="ui button" onClick={this.onClick.bind(this, 'forward')}>
            <i className="up chevron icon"></i>
            Up
          </button>
          <button className="ui button" onClick={this.onClick.bind(this, 'right')}>
            <i className="right chevron icon"></i>
            Right
          </button>
        </div>
        <div>
          Robots
          <pre id="robots">{ JSON.stringify(this.state.robots) }</pre>
          Markers
          <pre id="markers"></pre>
        </div>
        <svg width="1000" height="1000">
          { this.state.robots.map((robot, i) => {
            return (
              <Robot
                id={i}
                x={robot.pos.x}
                y={robot.pos.y}
                angle={robot.angle}
              />
            )
          })}
        </svg>
        <canvas id="canvas" width="1000" height="500"></canvas>
      </div>
    )
  }
}

window.addEventListener('resize', () => {
  // window.app.resize()
}, false)

function mapStateToProps(state) {
  return state
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
