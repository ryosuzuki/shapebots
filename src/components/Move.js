
import munkres from 'munkres-js'
import Assign from './Assign'
import Simulator from './Simulator'
import Calculate from './Calculate'

const Move = {
  forceStop: {},
  async move() {
    this.init()
    await this.sleep(1000)

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
    const dt = 1
    let error = 0
    let okCount = 0
    let distOk = false
    while (true) {
      try {
        if (this.forceStop[id]) throw('forceStop')
        let rvo = Calculate.getRvoVelocity(id, target, dt)
        let base = Math.min(400, rvo.dist+200)
        let a2 = base
        let b1 = base
        let a1 = 0
        let b2 = 0

        let distThreshold = 30
        let dirThreshold = 30
        let angleThreshold = 5
        let sleepTime = 30
        if (App.simulation) {
          distThreshold = 10
          dirThreshold = 10
          angleThreshold = 2
          sleepTime = 10
        }

        if (!distOk) {
          if (rvo.dist > distThreshold) {
            let param = 200
            if (Math.abs(rvo.diff) < 60) param = 100
            // move to the target position
            if (rvo.diff < -dirThreshold) { // left
              a2 = 0
              a1 = param
              b1 = param
              b2 = 0
            }
            if (rvo.diff > dirThreshold) { // right
              a2 = param
              a1 = 0
              b1 = 0
              b2 = param
            }
          } else {
            console.log('distOk')
            distOk = true
          }
        } else {
          console.log('angleDiff: ' + rvo.angleDiff)
          window.angleDiff = rvo.angleDiff
          if (Math.abs(rvo.angleDiff) > angleThreshold) {
            let param = 100
            // if (Math.abs(rvo.angleDiff) < 60) param = 100
            // rotate to the target angle
            // if (rvo.angleDiff < 0) { // left
              a2 = 0
              a1 = param
              b1 = param
              b2 = 0
            // } else { // right
            //   param += 30
            //   a2 = param
            //   a1 = 0
            //   b1 = 0
            //   b2 = param
            // }
          } else {
            okCount++
            console.log('okCount: ' + okCount)
            if (okCount > 3) break
          }
        }

        a1 = parseInt(a1)
        a2 = parseInt(a2)
        b1 = parseInt(b1)
        b2 = parseInt(b2)
        let command = { a1: a1, a2: a2, b1: b1, b2: b2 }
        let message = { command: command, ip: App.ips[id], port: App.port }

        if (App.simulation) {
          Simulator.moveRobot(id, command)
        } else {
          App.socket.send(JSON.stringify(message))
        }
        await this.sleep(sleepTime) // 100
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
    if (error <= 30){
      this.extendRobot(id, target.len)
    }
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