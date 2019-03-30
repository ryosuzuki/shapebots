
import munkres from 'munkres-js'
import Assign from './Assign'
import Simulator from './Simulator'

const Move = {

  /*
  let angleDiff = Math.min(180 - res.angleDiff, Math.abs(res.angleDiff))

  if (Math.abs(angleDiff) > angleThreshold) {
    let param = 120
    // param = Math.min(param, angleDiff * 5)
    // -90 < angle <  -1 -> left
    //   0 < angle <  90 -> right
    //  90 < angle < 180 -> left
    angleDiff = (360 + res.angleDiff) % 360
    console.log('angleDiff: ' +  angleDiff)
    let dir
    if (0 <= angleDiff < 90) {
      dir = 'right'
    }
    if (90 <= angleDiff < 270)

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
  */


  move() {
    let res = Assign.assign()
    let distMatrix = res.distMatrix
    let rids = res.rids
    let ids = munkres(distMatrix)
    for (let id of ids) {
      let pid = id[0]
      let rid = rids[id[1]]
      let target = App.state.targets[pid]
      console.log('rid: ' + rid, 'pid: ' + pid)
      this.moveRobot2(rid, target)
    }
  },

  async moveRobot(id, target) {
    let error = 0
    let prev
    let Ib = 200
    let Ip = 200
    while (true) {
      // try {
        let res = this.calculate(id, target)
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

        if (res.diff < 0) { // left
          a2 = Math.max(unit - Kd*D, 0) * Kp
          a1 = Math.max(-unit - Kd*D, 0) * Kp
        } else { // right
          b1 = Math.max(unit - Kd*D, 0) * Kp
          b2 = Math.max(-unit - Kd*D, 0) * Kp
        }

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

  calculate(id, target) {
    let robot = this.getRobotById(id)
    let dir = Math.atan2(target.x - robot.pos.x, target.y - robot.pos.y) * 180 / Math.PI
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
    let dist = Math.sqrt((target.x - robot.pos.x)**2 + (target.y - robot.pos.y)**2)
    return { diff: diff, dist: dist }
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
        let rvo = this.getRvoVelocity(id, target, dt)
        if (rvo.dist < 10) break

        let base = Math.min(200, rvo.dist+100)
        let a2 = base
        let b1 = base
        let a1 = 0
        let b2 = 0

        if (rvo.diff < -10) { // left
          a2 = 0
          a1 = base
        }
        if (rvo.diff > 10) { // right
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


  getRvoVelocity(id, target, dt) {
    const acceleration = 1
    const avoidanceTendency = 10

    const accel = acceleration
    const w = avoidanceTendency

    const robot = this.getRobotById(id)
    // const target = App.targets[id]
    if (!target) return { x: 0, y: 0 }

    let prefVx = target.x - robot.pos.x
    let prefVy = target.y - robot.pos.y
    const dist = Math.sqrt(prefVx**2 + prefVy**2)
    if (dist > 1) {
      prefVx *= robot.prefSpeed / dist
      prefVy *= robot.prefSpeed / dist
    }

    let rvoVx = prefVx
    let rvoVy = prefVy
    let min = Infinity

    for (let i = 0; i < 100; i++) {
      const vx = robot.velocity.x + accel * dt * (2 * Math.random() - 1)
      const vy = robot.velocity.y + accel * dt * (2 * Math.random() - 1)
      const collisionTime = this.getCollisionTime(id, vx, vy)
      const dvx = vx - prefVx
      const dvy = vy - prefVy
      const penalty = w / collisionTime + Math.sqrt(dvx**2 + dvy**2)
      if (penalty < min) {
        rvoVx = vx
        rvoVy = vy
        min = penalty
      }
    }

    let dir = Math.atan2(rvoVx, rvoVy) * 180 / Math.PI
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
    return { x: rvoVx, y: rvoVy, dist: dist, diff: diff }
  },


  getCollisionTime(id, vx, vy) {
    let tmin = Infinity
    let a = this.getRobotById(id)
    let max = App.state.robots.length
    for (let i = 1; i <= max; i++) {
      if (i == id) continue;

      const b = this.getRobotById(i)
      const ux = 2 * vx - a.velocity.x - b.velocity.x
      const uy = 2 * vy - a.velocity.y - b.velocity.y
      const dx = b.pos.x - a.pos.x
      const dy = b.pos.y - a.pos.y
      const s = a.size + b.size
      const c2 = ux * ux + uy * uy
      const c1 = -2 * (ux * dx + uy * dy)
      const c0 = dx * dx + dy * dy - s * s

      let t = Infinity;
      if (c2 == 0) {
        t = -c0 / c1
      } else {
        const discriminant = c1 * c1 - 4 * c2 * c0
        if (discriminant >= 0) {
          const sq = Math.sqrt(discriminant)
          const t1 = (-c1 - sq) / (2 * c2)
          const t2 = (-c1 + sq) / (2 * c2)
          if (c0 < 0) {
            t = 0;  // Already collided!
          } else if (c1 <= 0) {
            t = t1;
          }
        }
      }

      if (t < tmin) {
        tmin = t
      }
    }
    return tmin
  },


}

export default Move