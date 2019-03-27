
import munkres from 'munkres-js'
import Assign from './Assign'
import Simulator from './Simulator'
import Calculate from './Calculate'

const Move = {
  async move() {
    let initTime = this.init()
    await this.sleep(100)

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
    let max = 0
    for (let robot of App.state.robots) {
      if (robot.len > 1) {
        this.extendRobot(robot.id, 1)
        max = Math.max(max, robot.len)
      }
    }
    return max
  },

  getRobotById(id) {
    for (let robot of App.state.robots) {
      if (robot.id === id) return robot
    }
    return null
  },

  async moveRobot2(id, target) {
    const dt = 1
    while (true) {
      // try {
        let rvo = Calculate.getRvoVelocity(id, target, dt)
        let base = Math.min(200, rvo.dist+100)
        let a2 = base
        let b1 = base
        let a1 = 0
        let b2 = 0
        if (rvo.dist > 10) {
          // move to the target position
          if (rvo.diff < -10) { // left
            a2 = 0
            a1 = base
          }
          if (rvo.diff > 10) { // right
            b1 = 0
            b2 = base
          }
        } else if (Math.abs(rvo.angleDiff) > 2) {
          // rotate to the target angle
          if (rvo.angleDiff < 0) { // left
            a2 = 0
            a1 = base
          } else { // right
            b1 = 0
            b2 = base
          }
        } else {
          break
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
        await this.sleep(10) // 100
      // } catch (err) {
      //   console.log('lost AR marker')
      //   error++
      //   await this.sleep(100)
      //   if (error > 10) break
      // }
    }
    console.log('finish')
    this.stop(id)

    this.extendRobot(id, target.len)
  },

  extendRobot(id, len) {
    let max = 2000
    if (len > max) len = max
    let command = { pos_1: len, pos_2: len }
    let message = { command: command, ip: App.ips[id], port: App.port }
    if (App.simulation) {
      Simulator.extendRobot(id, command)
    } else {
      App.socket.send(JSON.stringify(message))
    }
  },

  async sleep(time) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, time)
    })
  },

  stop(id) {
    let command = { a1: 0, a2: 0, b1: 0, b2: 0 }
    let message = { command: command, ip: App.ips[id], port: App.port }
    App.socket.send(JSON.stringify(message))
  },


}

export default Move