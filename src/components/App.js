import React, { Component } from 'react'
import _ from 'lodash'

import Robot from './Robot'
import Target from './Target'
import Line from './Line'
import Move from './Move'
import Mouse from './Mouse'
import Update from './Update'
import Simulator from './Simulator'
import Animation from './Animation'

const socket = new WebSocket('ws://localhost:8080/ws');

class App extends Component {
  constructor(props) {
    super(props)
    window.app = this
    window.App = this

    this.simulation = true

    this.socket = socket
    this.state = {
      initBeforeMove: false,
      enableExtend: true,
      robots: [],
      ids: [],
      corners: [],
      targets: [],
      lines: [],
      dict: {},
      keyframes: [],
    }

    this.width = 1920
    this.height = 1080
    this.port = 8883
    this.ips = {
      1: '128.138.221.150',
      2: '128.138.221.148',
      3: '128.138.221.118',
      4: '128.138.221.155',
      5: '128.138.221.113',
      6: '128.138.221.177',
      7: '128.138.221.147',
      // 8: '128.138.221.212',
      9: '128.138.221.156',
      10: '128.138.221.102',
      12: '128.138.221.212',
    }

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

  log() {
    console.log('v2')
  }

  onClick(type) {
    console.log(type)
    if (type === 'init') {
      this.setState({ initBeforeMove: !this.state.initBeforeMove })
    }
    if (type === 'extend') {
      this.setState({ enableExtend: !this.state.enableExtend })
    }
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
          <div id="menu" className="four wide column">
            <div className="ui teal button" onClick={ Move.start.bind(Move) }>Move</div>
            <div className="ui basic button" onClick={ Move.clear.bind(Move) }>Clear</div>
            <div className="ui basic button" onClick={ Move.init.bind(Move) }>Init</div>
            <div className="ui basic button" onClick={ Move.stopAll.bind(Move) }>Stop</div>
            <div className="ui basic button" onClick={ Move.wave.bind(Move) }>Wave</div>
            <br/>
            <br/>
            <div className="field">
              <div className="ui checkbox" onClick={ this.onClick.bind(this, 'init') }>
                <input type="checkbox" className="hidden" checked={this.state.initBeforeMove} onChange={ () => { console.log('change') } } />
                <label>Initialize before moving</label>
              </div>
            </div>
            <br/>
            <div className="field">
              <div className="ui checkbox" onClick={ this.onClick.bind(this, 'extend') }>
                <input type="checkbox" className="hidden" checked={this.state.enableExtend} onChange={ () => { console.log('change') } } />
                <label>Enable extend</label>
              </div>
            </div>
            <div className="ui divider" />
            <div className="ui basic button" onClick={ Animation.add.bind(Animation) }>Add</div>
            <div className="ui basic button" onClick={ Animation.save.bind(Animation) }>Save</div>
            <div className="ui basic button" onClick={ Animation.load.bind(Animation) }>Load</div>
            <div className="field">
              <select className="ui dropdown" onChange={Animation.start.bind(Animation)}>
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
