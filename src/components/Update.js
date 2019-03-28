
const Update = {
  onMessage(e) {
    let data = JSON.parse(e.data)
    // console.log(data)
    data = data[0]
    this.updateCamera(data.image)
    this.updateRobots(data.ids, data.corners)
  },

  updateRobots(ids, corners) {
    let robots = []
    let i = 0
    for (let id of ids) {
      let robot = {}
      robot.id = id[0]
      if (robot.id < 5) {
        robot.id = robot.id + 1
      }
      let points = corners[i][0]
      let x = _.sum(points.map((point) => {
        return point[0]
      })) / 4
      let y = _.sum(points.map((point) => {
        return point[1]
      })) / 4
      // robot.points = points
      robot.pos = { x: App.width - x, y: y}

      let a1 = Math.atan2(points[0][0] - points[2][0], points[0][1] - points[2][1]) * 180 / Math.PI
      // let a2 = Math.atan2(points[1][0] - points[3][0], points[1][1] - points[3][1]) * 180 / Math.PI
      let angle = (a1 + 360 + 135) % 360
      robot.angle = angle
      robot.ip = App.ips[robot.id]

      robot.len = 0
      robot.velocity = { x: 0, y: 0 }
      robot.prefSpeed = 0.5
      robot.size = 1

      robots.push(robot)
      i++
    }
    App.setState({ robots: robots })
  },

  updateCamera(src) {
    const canvas = document.getElementById('canvas')
    const context = canvas.getContext('2d')
    const image = new Image()
    image.src = 'data:image/png;base64,' + src
    image.onload = () => {
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
    }
  }

}

export default Update