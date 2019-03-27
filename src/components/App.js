import React, { Component } from 'react'
import _ from 'lodash'

const socket = new WebSocket('ws://localhost:8080/ws');

import Robot from './Robot'
import Target from './Target'
import Line from './Line'

import Move from './Move'
import Mouse from './Mouse'
import Update from './Update'
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
      targets: [],
      lines: [],
      dict: {}
    }

    this.width = 1920
    this.height = 1080
    this.port = 8883
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

    this.simulation = false
    this.log()
  }

  componentDidMount() {
    // this.frameId = requestAnimationFrame(this.animate)
    if (this.simulation) {
      Simulator.initRobots()
    } else {
      this.socket.onmessage = Update.onMessage.bind(Update)
    }
  }

  move() {
    let targets = []
    for (let line of this.state.lines) {
      let target = {
        x: line.center.x,
        y: line.center.y,
        angle: line.angle,
        len: line.len
      }
      targets.push(target)
    }
    this.setState({ targets: targets }, () => {
      Move.move()
    })
  }

  init() {
    Move.init()
  }

  clear() {
    this.init()
    this.setState({ targets: [], lines: [] })
  }

  stop() {
    for (let id = 1; id <= 10; id++) {
      Move.forceStop(id)
    }
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
            <svg id="svg"
              width={ this.width / 2 }
              height={ this.height / 2 }
              onMouseDown={ Mouse.onMouseDown.bind(Mouse) }
              onMouseMove={ Mouse.onMouseMove.bind(Mouse) }
              onMouseUp={ Mouse.onMouseUp.bind(Mouse) }
            >
              { this.state.robots.map((robot, i) => {
                return (
                  <Robot id={robot.id} key={i} x={robot.pos.x} y={robot.pos.y} angle={robot.angle} len={robot.len} />
                )
              })}

              { this.state.targets.map((target, i) => {
                return (
                  <Target id={i} key={i} x={target.x} y={target.y} />
                )
              })}

              { this.state.lines.map((line, i) => {
                return (
                  <Line id={i} key={i} op={line.op} np={line.np} center={line.center} angle={line.angle} len={line.len} />
                )
              })}

            </svg>
          </div>
          <div className="four wide column">
            <div className="ui teal button" onClick={ this.move.bind(this) }>Move</div>
            <div className="ui basic button" onClick={ this.clear.bind(this) }>Clear</div>
            <div className="ui basic button" onClick={ this.init.bind(this) }>Init</div>
            <br/>
            <div className="ui basic button" onClick={ this.stop.bind(this) }>Stop</div>
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
