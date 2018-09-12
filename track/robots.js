const _ = require('lodash')
const { exec } = require('child_process');

function detectRobots() {
  this.positions = []

  this.min = this.redMin
  this.max = this.redMax

  if(process.env.USER='shohei'){
    var val = 130// white
  } else {
    var val = 200// white
  }

  this.min = [val, val, val]
  this.max = [255, 255, 255]

  let imCanny = this.im.copy()
  imCanny.cvtColor('CV_BGR2GRAY')
  imCanny.inRange(this.min, this.max)
  imCanny.dilate(3)
  imCanny.erode(2)

  // this.im = imCanny
  // return

  let contours = imCanny.findContours()
  let threshold = 1000
  let ids = []
  for (let i = 0; i < contours.size(); i++) {
    // console.log(contours.area(i))
    if (threshold > contours.area(i)) continue

    /*
    let arcLengh = contours.arcLength(i, true)
    let epsilon = 0.1 * arcLengh
    let isColsed = true
    contours.approxPolyDP(i, epsilon, isColsed)
    if (contours.cornerCount(i) !== 4) continue
    */

    ids.push(i)
  }

  let positions = []
  for (let id of ids) {
    let pos = { x: 0, y: 0 }
    let count = contours.cornerCount(id)
    for (let i = 0; i < count; i++) {
      let point = contours.point(id, i)
      pos.x += point.x
      pos.y += point.y
    }
    pos.x /= count
    pos.y /= count
    positions.push(pos)
  }

  // console.log(positions)
  this.positions = positions
  this.socket.emit('robots:update', this.positions)
}

module.exports = detectRobots
