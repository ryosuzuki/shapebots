import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from '../redux/actions'
import _ from 'lodash'

const socket = io.connect('http://localhost:4000/')

import Robot from './Robot'

class App extends Component {
  constructor(props) {
    super(props)
    window.app = this
    this.socket = socket
    this.state = {
      robots: []
    }
    this.socket.on('robots:update', this.updateRobots.bind(this))
    // this.socket.on('markers:update', this.updateMarkers.bind(this))
    this.socket.on('buffer', this.updateCamera.bind(this))
  }

  updateRobots(robots) {
    console.log('update')
    this.setState({ robots: robots })
  }

  componentDidMount() {
    this.frameId = requestAnimationFrame(this.animate)
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

  updateCamera(data) {
    window.rect = data.rect
    window.panel = data.panel
    const buffer = data.bufferPanel
    const canvas = document.getElementById('canvas')
    const context = canvas.getContext('2d')
    const img = new Image()
    const uint8Arr = new Uint8Array(buffer);
    const str = String.fromCharCode.apply(null, uint8Arr);
    const base64String = btoa(str);
    img.onload = function () {
      context.drawImage(this, 0, 0, canvas.width, canvas.height)
    }
    img.src = 'data:image/png;base64,' + base64String
  }

  onClick(event) {
    let type = $('#type').val()
    let duration = $('#duration').val()
    let command = { type: parseInt(type), duration: parseInt(duration) }
    this.socket.emit('send:command', command)
  }

  render() {
    return (
      <div>
        <div className="ui inline form">
          <select id="type">
            <option value="1">Forward</option>
            <option value="2">Backward</option>
            <option value="3">Rotate (Clockwise)</option>
            <option value="4">Rotate (Counter Clockwise)</option>
          </select>
          <input type="text" id="duration" value="100"></input>
          <button classname="ui basic button" onClick={this.onClick.bind(this)}>Send</button>
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
