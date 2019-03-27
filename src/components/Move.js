
import munkres from 'munkres-js'
import Assign from './Assign'
import Simulator from './Simulator'

const Move = {

  move() {
    let res = Assign.assign()
    let distMatrix = res.distMatrix
    let rids = res.rids
    let ids = munkres(distMatrix)
    for (let id of ids) {
      let pid = id[0]
      let rid = rids[id[1]]
      let point = App.state.points[pid]
      console.log('rid: ' + rid, 'pid: ' + pid)
      this.moveRobot(rid, point)
    }
  },

  async moveRobot(id, point) {
    let error = 0
    let prev
    let Ib = 200
    let Ip = 200
    while (true) {
      // try {
        let res = this.calculate(id, point)
        if (res.dist < 10) break

        // forward: a2, b1, right: a2, left: b1
        let base = Math.min(Ib, res.dist+100)
        let a2 = base
        let b1 = base
        let a1 = 0
        let b2 = 0
        let param = 5

        let unit = (90 - Math.abs(res.diff)) / 90
        let Kd = 0.5
        let D = !prev ? 0 : unit - prev
        prev = unit
        Ib += 20
        Ip += 10
        let Kp = Math.min(Ip, base)
        console.log(Kp)
        /*
        Ryo's note: If Kp is too high, it will be overshooting. Thus, start from a small value at the beginning to avoid overshooting, while gradually increasing the value once it starts adjusting the path and angle.
        */

        // if (res.diff < 0) { // left
        //   a2 = Math.max(unit - Kd*D, 0) * Kp
        //   a1 = Math.max(-unit - Kd*D, 0) * Kp
        // } else { // right
        //   b1 = Math.max(unit - Kd*D, 0) * Kp
        //   b2 = Math.max(-unit - Kd*D, 0) * Kp
        // }

        /*
        Simlify
        */
        if (res.diff < -10) { // left
          a2 = 0
          a1 = base
        }
        if (res.diff > 10) { // right
          b1 = 0
          b2 = base
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
        await this.sleep(10)
      // } catch (err) {
      //   console.log('lost AR marker')
      //   error++
      //   await this.sleep(100)
      //   if (error > 10) break
      // }
    }
    console.log('finish')
    this.stop(id)
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

  calculate(id, point) {
    let robot = this.getRobot(id)
    let dir = Math.atan2(point.x - robot.pos.x, point.y - robot.pos.y) * 180 / Math.PI
    dir = (-dir + 180) % 360
    let diff = Math.min((360) - Math.abs(robot.angle - dir), Math.abs(robot.angle - dir))
    // 1 - 359 = -358 < 0 && 358 > 180 -> -2
    // 1 - 180 = -179 < 0 && 179 < 180 -> +179
    // 15 - 1  =  14  > 0 && 14  < 180 -> -14
    // 1 - 200 = -199 < 0 && 199 > 180 -> -161
    // 359 - 1 =  358 > 0 && 358 > 180 -> +2
    if (robot.angle - dir < 0 && Math.abs(robot.angle - dir) > 180) {
      diff = -diff
    }
    if (robot.angle - dir > 0 && Math.abs(robot.angle - dir) < 180) {
      diff = -diff
    }
    let dist = Math.sqrt((point.x - robot.pos.x)**2 + (point.y - robot.pos.y)**2)
    return { diff: diff, dist: dist }
  },

  getRobot(id) {
    for (let robot of App.state.robots) {
      if (robot.id === id) return robot
    }
    return null
  }


}

export default Move