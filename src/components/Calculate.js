
const Calculate = {
  getRobotById(id) {
    for (let robot of App.state.robots) {
      if (robot.id === id) return robot
    }
    return null
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

    let angleDiff = target.angle - (robot.angle + 90)
    angleDiff = Math.round(angleDiff)
    return { x: rvoVx, y: rvoVy, dist: dist, diff: diff, angleDiff: angleDiff }
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
  }

}

export default Calculate