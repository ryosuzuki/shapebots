import React, { Component } from 'react'
import _ from 'lodash'
import FileSaver from 'file-saver'

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
      dict: {},
      keyframes: []
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

    this.simulation = true //false
    this.log()
  }

  componentDidMount() {
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
    console.log('v1')
  }

  add() {
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
    let keyframes = this.state.keyframes
    keyframes.push({ targets: targets, lines: this.state.lines })
    this.setState({ keyframes: keyframes })
  }

  save() {
    let name = window.prompt('Enter file name', '');
    let json = {
      name: name,
      keyframes: this.state.keyframes
    }
    console.log(json)
    let str = JSON.stringify(json)
    const request = new XMLHttpRequest()
    request.open('POST', '/', true)
    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    request.send(str)
  }

  load() {
    const showOpenFileDialog = () => {
      return new Promise(resolve => {
        const input = document.createElement('input');
        input.type = 'file'
        input.accept = '.json, application/json'
        input.onchange = event => { resolve(event.target.files[0]) }
        input.click()
      })
    }

    const readAsText = file => {
      return new Promise(resolve => {
        const reader = new FileReader()
        reader.readAsText(file)
        reader.onload = () => { resolve(reader.result) }
      })
    }

    (async () => {
      const file = await showOpenFileDialog()
      const content = await readAsText(file)
      let json = JSON.parse(content)
      console.log(json)
      this.setState({ keyframes: json })
    })()
  }

  animate(event) {
    let i = event.target.value
    let targets = this.state.keyframes[i].targets
    let lines = this.state.keyframes[i].lines

    this.setState({ targets: targets, lines: lines }, () => {
      Move.move()
    })
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
            <div className="ui basic button" onClick={ this.stop.bind(this) }>Stop</div>
            <br/>
            <div className="ui divider" />
            <div className="ui basic button" onClick={ this.add.bind(this) }>Add</div>
            <div className="ui basic button" onClick={ this.save.bind(this) }>Save</div>
            <div className="ui basic button" onClick={ this.load.bind(this) }>Load</div>
            <div className="field">
              <select className="ui dropdown" onChange={this.animate.bind(this)}>
                <option value="">Choose</option>
                { this.state.keyframes.map((keyframe, i) => {
                  return (
                    <option key={ i } value={ i }>{`keyframe-${i}`}</option>
                  )
                })}
              </select>
            </div>
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

export default App
