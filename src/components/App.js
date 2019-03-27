import React, { Component } from 'react'
import _ from 'lodash'

const socket = new WebSocket('ws://localhost:8080/ws');

import Robot from './Robot'
import Point from './Point'

import Move from './Move'
import Simulator from './Simulator'

class App extends Component {
  constructor(props) {
    super(props)
    window.app = this
    window.App = this

    this.socket = socket
    this.state = {
      robots: [],
      ids: [],
      corners: [],
      points: []
    }

    this.width = 1920
    this.height = 1080

    this.ips = {
      1: '128.138.221.148',
      2: '128.138.221.150',
      3: '128.138.221.118',
      4: '128.138.221.155',
      5: '128.138.221.113',
      6: '128.138.221.177',
      7: '128.138.221.147',
      8: '128.138.221.212',
      9: '128.138.221.156',
      10: '128.138.221.102'
    }

    this.port = 8883

    this.simulation = true

    this.log()
  }

  componentDidMount() {
    // this.frameId = requestAnimationFrame(this.animate)
    if (this.simulation) {
      Simulator.initRobots()
    } else {
      this.socket.onmessage = this.onMessage.bind(this)
    }
  }

  onMessage(e) {
    let data = JSON.parse(e.data)
    console.log(data)
    data = data[0]
    this.updateCamera(data.image)
    this.updateRobots(data.ids, data.corners)
  }

  updateRobots(ids, corners) {
    let robots = []
    let i = 0
    for (let id of ids) {
      let robot = {}
      robot.id = id[0]
      let points = corners[i][0]
      let x = _.sum(points.map((point) => {
        return point[0]
      })) / 4
      let y = _.sum(points.map((point) => {
        return point[1]
      })) / 4
      // robot.points = points
      robot.pos = { x: this.width - x, y: y}

      let a1 = Math.atan2(points[0][0] - points[2][0], points[0][1] - points[2][1]) * 180 / Math.PI
      // let a2 = Math.atan2(points[1][0] - points[3][0], points[1][1] - points[3][1]) * 180 / Math.PI
      let angle = (a1 + 360 + 135) % 360
      robot.angle = angle
      robot.ip = this.ips[robot.id]
      robots.push(robot)
      i++
    }
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
  }

  move() {
    Move.move()
  }

  onClick(event) {
    if (!this.count) this.count = 0
    let x = event.clientX
    let y = event.clientY

    let max = this.state.robots.length
    let i = this.count % max
    let point = { x: x * 2, y: y * 2 }
    let points = this.state.points
    points[i] = point
    this.setState({ points: points })
    this.count++
  }

  log() {
    console.log('v3')
  }

  animate() {
    this.frameId = window.requestAnimationFrame(this.animate)
  }

  render() {
    return (
      <div>
        <div className="ui grid">
          <div className="twelve wide column">
            <canvas id="canvas" width={ this.width / 2 } height={ this.height / 2 }></canvas>
            <svg id="svg" width={ this.width / 2 } height={ this.height / 2 } onClick={ this.onClick.bind(this) }>
              { this.state.robots.map((robot, i) => {
                return (
                  <Robot
                    id={robot.id}
                    key={i}
                    x={robot.pos.x}
                    y={robot.pos.y}
                    angle={robot.angle}
                  />
                )
              })}

              { this.state.points.map((point, i) => {
                return (
                  <Point
                    id={i}
                    key={i}
                    x={point.x}
                    y={point.y}
                  />
                )
              })}
            </svg>
          </div>
          <div className="four wide column">
            <div className="ui teal button" onClick={ this.move.bind(this) }>
              Move
            </div>
            <br/>
            <br/>
            <div>
              Robots
              <pre id="robots">{ JSON.stringify(this.state.robots, null, 2) }</pre>
            </div>
          </div>
        </div>
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

export default App
