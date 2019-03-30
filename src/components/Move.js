
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
  enableExtend: false,
  example: '',

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

  clear() {
    // this.init()
    App.setState({ targets: [], lines: [] })
  },

  stopAll() {
    for (let id = 1; id <= 10; id++) {
      Move.forceStop(id)
    }
  },

  async move() {
    // this.init()
    // await this.sleep(1500)

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
    let error = 0
    let okCount = 0
    let distOk = false
    while (true) {
      try {
        if (this.forceStop[id]) throw('forceStop')
        let res = Calculate.calculate(id, target)

        let distThreshold = 50
        let dirThreshold = 30
        if (this.example === 'cleanup') dirThreshold = 20
        let angleThreshold = 5
        if (this.example === 'cleanup') angleThreshold = 15
        let sleepTime = 30
        if (App.simulation) {
          distThreshold = 10
          dirThreshold = 10
          angleThreshold = 5
          sleepTime = 10
        }

        let base = Math.min(400, res.dist+100)
        if (this.example === 'cleanup') base = 800

        let a1 = 0
        let a2 = base
        let b1 = base
        let b2 = 0

        if (res.dist > distThreshold) {
          const dt = 1
          let rvo = Calculate.getRvoVelocity(id, target, dt)
          let param = 120
          let dir
          if (0 <= rvo.diff < dirThreshold) {
            dir = 'forward'
          }
          if (dirThreshold <= rvo.diff && rvo.diff < 90) {
            dir = 'right'
          }
          if (90 <= rvo.diff && rvo.diff < 180 - dirThreshold) {
            dir = 'left'
          }
          if (180 - dirThreshold <= rvo.diff && rvo.diff < 180 + dirThreshold) {
            dir = 'backward'
          }
          if (180 + dirThreshold <= rvo.diff && rvo.diff < 270) {
            dir = 'right'
          }
          if (270 <= rvo.diff && rvo.diff < 360 - dirThreshold) {
            dir = 'left'
          }
          if (360 - dirThreshold <= rvo.diff) {
            dir = 'forward'
          }

          switch (dir) {
            case 'forward':
              break
            case 'backward':
              a1 = base
              a2 = 0
              b1 = 0
              b2 = base
              break
            case 'left':
              a1 = param
              a2 = 0
              b1 = param
              b2 = 0
              break
            case 'right':
              param += 30
              a1 = 0
              a2 = param
              b1 = 0
              b2 = param
          }

          let command = { a1: a1, a2: a2, b1: b1, b2: b2 }
          let message = { command: command, ip: App.ips[id], port: App.port }
          if (App.simulation) {
            Simulator.moveRobot(id, command)
          } else {
            App.socket.send(JSON.stringify(message))
          }
          await this.sleep(sleepTime) // 100

        } else {
          distOk = true
          sleepTime = 10
          let angleDiff = Math.min(180 - res.angleDiff, Math.abs(res.angleDiff))
          if (Math.abs(angleDiff) > angleThreshold) {
            let param = 120
            // param = Math.min(param, angleDiff * 5)
            // -90 < angle <  -1 -> left
            //   0 < angle <  90 -> right
            //  90 < angle < 180 -> left
            console.log('angleDiff: ' +  res.angleDiff)
            if (res.angleDiff < 0 || res.angleDiff > 90) { // left
              a2 = 0
              a1 = param
              b1 = param // angleDiff * 2
              b2 = 0
            } else { // right
              param += 30
              a2 = param // angleDiff * 2
              a1 = 0
              b1 = 0
              b2 = param
            }
          } else {
            a1 = 0
            a2 = 0
            b1 = 0
            b2 = 0
            okCount++
            console.log('okCount: ' + okCount)
            if (okCount > 3) break
          }

          let command = { a1: a1, a2: a2, b1: b1, b2: b2 }
          let message = { command: command, ip: App.ips[id], port: App.port }
          if (App.simulation) {
            Simulator.moveRobot(id, command)
            await this.sleep(sleepTime) // 100
          } else {
            App.socket.send(JSON.stringify(message))

            if (Math.abs(angleDiff) > 60) {
              sleepTime = 60
            } else {
              sleepTime  = 50
            }
            // sleepTime = Math.abs(angleDiff)
            await this.sleep(sleepTime) // 100

            command = { a1: 0, a2: 0, b1: 0, b2: 0 }
            message = { command: command, ip: App.ips[id], port: App.port }
            App.socket.send(JSON.stringify(message))
            await this.sleep(30) // 100
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
    console.log('finish')
    this.stop(id)
    if (error <= 20){
      if (this.enableExtend) this.extendRobot(id, target.len)
    }
    // await this.sleep(1000)
    let robot = this.getRobotById(id)
    let angleDiff = target.angle - (robot.angle + 90)
    console.log(angleDiff)
  },

  extendRobot(id, len) {
    if (App.simulation) {
      let command = { pos_1: len, pos_2: len }
      Simulator.extendRobot(id, command)
    } else {
      let reel = parseInt((len - 100) * 10)
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