
const Assign = {
  assign() {
    let distMatrix = []
    let rids = []
    for (let point of App.state.points) {
      let distArray = []
      for (let robot of App.state.robots) {
        let dist = Math.sqrt((point.x - robot.pos.x)**2 + (point.y - robot.pos.y)**2)
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