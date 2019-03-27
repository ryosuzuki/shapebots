
const Assign = {
  assign() {
    let distMatrix = []
    let rids = []
    for (let target of App.state.targets) {
      let distArray = []
      for (let robot of App.state.robots) {
        let dist = Math.sqrt((target.x - robot.pos.x)**2 + (target.y - robot.pos.y)**2)
        distArray.push(dist)
        rids.push(robot.id)
      }
      distMatrix.push(distArray)
    }
    if (!distMatrix.length) return
    return { distMatrix: distMatrix, rids: rids }
  }

}

export default Assign