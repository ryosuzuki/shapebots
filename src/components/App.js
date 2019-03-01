import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from '../redux/actions'
import _ from 'lodash'
import 'babel-polyfill'

const socket = new WebSocket('ws://localhost:8080/ws');

import Robot from './Robot'

class App extends Component {
  constructor(props) {
    super(props)
    window.app = this
    this.socket = socket
    this.state = {
      robots: [],
      ids: [],
      corners: [],
      point: { x: -100, y: -100 }
    }
    this.socket.onmessage = this.onMessage.bind(this)

    this.width = 1920
    this.height = 1080

    this.ips = {
      1: '192.168.27.172'
    }
    this.port = 8883

  }

  componentDidMount() {
    // this.frameId = requestAnimationFrame(this.animate)
  }

  onMessage(e) {
    let data = JSON.parse(e.data)
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

  onClick(event) {
    let x = event.clientX
    let y = event.clientY
    let point = { x: x * 2, y: y * 2 }
    this.setState({ point: point })

    let id = 1
    this.move(id, point)
  }

  // forward: a2, b1
  // right: a2
  // left: b1

  async move(id, point) {
    while (true) {
      try {
        let res = this.calculate(id, point)
        if (res.dist < 100) break
        console.log(res)
        let a2 = Math.min(255, parseInt(res.dist))
        let b1 = Math.min(255, parseInt(res.dist))
        if (res.diff < 0) { // left
          console.log('left')
          a2 = Math.max(a2 - parseInt(Math.abs(res.diff))*3, 0)
        } else { // right
          console.log('right')
          b1 = Math.max(b1 - parseInt(Math.abs(res.diff))*3, 0)
        }
        let command = { a1: 0, a2: a2, b1: b1, b2: 0 }
        console.log(command)
        let message = { command: command, ip: this.ips[id], port: this.port }
        this.socket.send(JSON.stringify(message))
        await this.sleep(100)
      } catch (err) {
        // lost AR marker
        break
      }
    }
    console.log('finish')
    this.stop()
  }

  stop() {
    let id = 1
    let command = { a1: 0, a2: 0, b1: 0, b2: 0 }
    let message = { command: command, ip: this.ips[id], port: this.port }
    this.socket.send(JSON.stringify(message))
  }

  async sleep(time) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, time)
    })
  }

  calculate(id, point) {
    let robot = this.state.robots[0] // id
    let dir = Math.atan2(point.x - robot.pos.x, point.y - robot.pos.y) * 180 / Math.PI
    dir = (-dir + 180) % 360
    let diff = dir - robot.angle
    let dist = Math.sqrt((point.x - robot.pos.x)**2 + (point.y - robot.pos.y)**2)
    // robot.point = point
    // robot.diff = diff
    // robot.dist = dist
    // let robots = this.state.robots
    // robots[id] = robot
    // this.setState({ robots: robots })
    return { diff: diff, dist: dist }
  }

  async moveOld(id, point) {
    while (true) {
      while (true) {
        let finish = await this.rotate(id, point)
        if (finish) {
          console.log('rotate finish')
          break
        }
      }
      let finish = await this.forward(id, point)
      if (finish) {
        console.log('forward finish')
        break
      }
    }
    console.log('finish')
  }

  rotate(id, point) {
    let robot = this.state.robots[0] // id
    let angle = Math.atan2(point.x - robot.pos.x, point.y - robot.pos.y) * 180 / Math.PI
    angle = (-angle + 180) % 360
    let diff = angle - robot.angle
    let left = { a1: 255, a2: 0, b1: 255, b2: 0 }
    let right = { a1: 0, a2: 255, b1: 0, b2: 255 }
    let command
    if (diff < 0) {
      command = left
      console.log('left')
    } else {
      command = right
      console.log('right')
    }
    let duration = parseInt(Math.abs(diff))
    if (duration > 100) {
      command.duration = 100
    } else {
      command.duration = duration
    }
    command.duration = 20
    let message = { command: command, ip: this.ips[id], port: this.port }
    if (duration < 30) {
      return true
    } else {
      this.socket.send(JSON.stringify(message))
      return new Promise((resolve, reject) => {
        setTimeout(resolve, command.duration * 2)
      })
    }
    // return { duration: duration, message: message }
  }

  forward(id, point) {
    let robot = this.state.robots[0] // id
    let dist = Math.sqrt((point.x - robot.pos.x)**2 + (point.y - robot.pos.y)**2)
    let forward = { a1: 0, a2: 255, b1: 255, b2: 0 }
    let duration = parseInt(dist)
    let command = forward
    command.duration = parseInt(dist)
    // command.duration = 100
    let message = { command: command, ip: this.ips[id], port: this.port }
    if (duration < 100) {
      return true
    } else {
      this.socket.send(JSON.stringify(message))
      return new Promise((resolve, reject) => {
        setTimeout(resolve, command.duration * 2)
      })
    }
    // return { duration: duration, message: message }
  }

  async testSleep() {
    for (let i = 0; i < 10; i++) {
      console.log(i)
      let res = await this.test(i)
      if (res) {
        console.log('break')
        break
      }
    }
    console.log('end')
  }

  test(i) {
    if (i > 5) {
      return true
    } else {
      return new Promise((resolve, reject) => {
        setTimeout(resolve, 1000)
      })
    }
  }

  // stop() {
  //   cancelAnimationFrame(this.frameId)
  // }

  animate() {
    this.frameId = window.requestAnimationFrame(this.animate)
  }

  updateState(state) {
    this.props.store.dispatch(actions.updateState(state))
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
                    x={robot.pos.x}
                    y={robot.pos.y}
                    angle={robot.angle}
                  />
                )
              })}
              <g id="point">
                <circle
                  cx={this.state.point.x / 2}
                  cy={this.state.point.y / 2}
                  r="10"
                  fill="red"
                />
                <text x={this.state.point.x / 2 + 5} y={this.state.point.y / 2 - 10} className="label">
                  x: { this.state.point.x }, y: { this.state.point.y }
                </text>
              </g>
            </svg>
          </div>
          <div className="four wide column">
            <div>
              Robots
              <pre id="robots">{ JSON.stringify(this.state.robots, null, 2) }</pre>
              Markers
              <pre id="markers"></pre>
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

export default connect(mapStateToProps, mapDispatchToProps)(App)

