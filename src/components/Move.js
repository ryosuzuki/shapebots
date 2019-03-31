import _ from 'lodash'
import munkres from 'munkres-js'
import Assign from './Assign'
import Simulator from './Simulator'
import Calculate from './Calculate'

/*
Clean up
- base: constant 400
- robots: 2, 3

Scale up Square
- all robots should face outside
- robots: 2, 3, 5, 7

*/

const Move = {
  forceStop: {},
  strong: false,
  example: '', // cleanup
  lens: {},

  start() {
    let targets = []
    for (let line of App.state.lines) {
      let target = {
        x: line.center.x,
        y: line.center.y,
        angle: line.angle,
        len: line.len
      }
      targets.push(target)
    }
    App.setState({ targets: targets }, () => {
      this.move()
    })
  },

  async wave() {
    let lens = [100, 200, 300]
    let keys = [0, 1, 2, 1]
    let robots = _.sortBy(App.state.robots, ['pos.x'])
    let ids = robots.map(robot => robot.id)
    while (true) {
      if (this.forceStop[ids[0]]) break
      let i = 0
      for (let id of ids) {
        let key = keys[i]
        this.extendRobot(id, lens[key])
        i = (i + 1) % 4
      }
      await this.sleep(4000)
      keys = [keys[1], keys[2], keys[3], keys[0]]
    }
  },

  clear() {
    // this.init()
    App.setState({ targets: [], lines: [] })
  },

  stopAll() {
    for (let id = 1; id <= 12; id++) {
      Move.forceStop(id)
    }
  },

  async move() {
    let res = Assign.assign()
    let distMatrix = res.distMatrix
    let rids = res.rids
    let ids = munkres(distMatrix)
    let dict = {}
    for (let id of ids) {
      let tid = id[0]
      let rid = rids[id[1]]
      let target = App.state.targets[tid]
      dict[rid] = tid
      console.log('rid: ' + rid, 'tid: ' + tid)
      this.moveRobot2(rid, target)
    }
    App.setState({ dict: dict })
  },

  init() {
    for (let robot of App.state.robots) {
      this.extendRobot(robot.id, 1)
    }
  },

  getRobotById(id) {
    for (let robot of App.state.robots) {
      if (robot.id === id) return robot
    }
    return null
  },

  async moveRobot2(id, target) {
    if (App.state.initBeforeMove) {
      this.init()
      let time = this.lens[id]
      await this.sleep(time + 500)
    }

    let error = 0
    let okCount = 0
    let distOk = false
    let prev
    while (true) {
      try {
        if (this.forceStop[id]) throw('forceStop')
        let res = Calculate.calculate(id, target)

        let distThreshold = 30
        let dirThreshold = 50
        let angleThreshold = 5
        let sleepTime = 30
        if (App.simulation) {
          distThreshold = 10
          dirThreshold = 10
          angleThreshold = 5
          sleepTime = 10
        }
        if (this.example === 'cleanup') {
          distThreshold = 200
          dirThreshold = 20
          angleThreshold = 50
        }

        if (res.dist > distThreshold) {
          const dt = 1
          let rvo = Calculate.getRvoVelocity(id, target, dt)

          prev = null
          let calc = this.getDirection(rvo.diff, dirThreshold)
          let dir = calc.dir
          let diff = calc.diff
          let base = Math.min(600, res.dist+50)
          let Kd = Math.min(8, (res.dist + 200) / 100)
          if (this.strong) base = 600
          let param = 120
          let command
          switch (dir) {
            case 'forward':
              command = { a1: 0, a2: base+diff*Kd, b1: base-diff*Kd, b2: 0 }
              break
            case 'backward':
              command = { a1: base+diff*Kd, a2: 0, b1: 0, b2: base-diff*Kd }
              break
            case 'left':
              command = { a1: param+diff*0, a2: 0, b1: param+diff*0, b2: 0 }
              break
            case 'right':
              command = { a1: 0, a2: param+diff*0, b1: 0, b2: param+diff*0 }
              break
          }
          if (App.simulation) {
            Simulator.moveRobot(id, command)
          } else {
            let message = { command: command, ip: App.ips[id], port: App.port }
            App.socket.send(JSON.stringify(message))
          }
          await this.sleep(sleepTime) // 100
        } else {
          distOk = true
          let angleDiff = (360 + res.angleDiff) % 360
          let calc = this.getDirection(angleDiff, angleThreshold)
          let dir = calc.dir
          let diff = calc.diff
          if (dir === 'forward' || dir === 'backward') dir = 'stop'

          let Kd = 2
          let D = !prev? 0 : diff - prev
          prev = diff

          // let param = Math.min(150, Math.abs(diff)*15) - D * Kd
          // let param = 100 + p
          let param = 200
          let ms = Math.abs(diff)
          let command
          switch (dir) {
            case 'left':
              command = { a1: param, a2: 0, b1: param, b2: 0, ms: ms }
              break
            case 'right':
              command = { a1: 0, a2: param, b1: 0, b2: param, ms: ms }
              break
            default:
              command = { a1: 0, a2: 0, b1: 0, b2: 0 }
              break
          }
          if (dir === 'stop') {
            okCount++
            console.log('okCount: ' + okCount)
            if (okCount > 8) break
          }
          if (App.simulation) {
            Simulator.moveRobot(id, command)
            await this.sleep(sleepTime) // 100
          } else {
            let message = { command: command, ip: App.ips[id], port: App.port }
            App.socket.send(JSON.stringify(message))
            await this.sleep(100) // 100
          }
        }
      } catch (err) {
        console.log(err)
        console.log('lost AR marker')
        error++
        await this.sleep(100)
        if (error > 30) break
      }
    }
    console.log('finish: ' + id)
    this.stop(id)
    if (error <= 20){
      if (App.state.enableExtend) this.extendRobot(id, target.len)
    }
    await this.sleep(1000)
    let robot = this.getRobotById(id)
    let angleDiff = target.angle - (robot.angle + 90)
    angleDiff = (360 + angleDiff) % 360
    angleDiff = angleDiff % 180
    angleDiff = Math.min(180 - angleDiff, angleDiff)
    console.log(angleDiff)
  },

  getDirection(diff, threshold) {
    if (0 <= diff && diff < threshold) {
      return { dir: 'forward', diff: diff }
    }
    if (threshold <= diff && diff < 90) {
      return { dir: 'right', diff: diff }
    }
    if (90 <= diff && diff < 180 - threshold) {
      return { dir: 'left', diff: 180 - diff }
    }
    if (180 - threshold <= diff && diff < 180 + threshold) {
      return { dir: 'backward', diff: 180 - diff }
    }
    if (180 + threshold <= diff && diff < 270) {
      return { dir: 'right', diff: diff - 180 }
    }
    if (270 <= diff && diff < 360 - threshold) {
      return { dir: 'left', diff: 360 - diff }
    }
    if (360 - threshold <= diff && diff <= 360) {
      return { dir: 'forward', diff: diff - 360 }
    }
  },

  extendRobot(id, len) {
    if (App.simulation) {
      let command = { pos_1: len, pos_2: len }
      Simulator.extendRobot(id, command)
    } else {
      let reel = parseInt((len - 100) * 10) + 1
      let max = 4000
      if (reel < 0) reel = 1
      if (reel > max) reel = max
      console.log('extend: ' + reel)
      let command = { pos_1: reel, pos_2: reel }
      let message = { command: command, ip: App.ips[id], port: App.port }
      // 0 -> 97
      // 1000 -> 217
      // 2000 -> 306
      // 3000 -> 391
      // 4000 -> 480
      this.lens[id] = reel
      App.socket.send(JSON.stringify(message))
    }
  },

  async sleep(time) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, time)
    })
  },

  forceStop(id) {
    this.forceStop[id] = true
  },

  stop(id) {
    let command = { a1: 0, a2: 0, b1: 0, b2: 0 }
    let message = { command: command, ip: App.ips[id], port: App.port }
    App.socket.send(JSON.stringify(message))
    this.forceStop[id] = false
  },


}

export default Move


