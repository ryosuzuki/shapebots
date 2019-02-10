const _ = require('lodash')

function detectMarkers() {
  this.markers = []

  this.min = this.redMin
  this.max = this.redMax

  // let val = 255 // white
  // this.min = [0, 255, 255]
  // this.max = [80, 255, 255]

  let imCanny = this.im.copy()
  imCanny.convertHSVscale()
  // imCanny.cvtColor('CV_BGR2GRAY')
  imCanny.inRange(this.min, this.max)
  imCanny.dilate(10)
  imCanny.erode(5)

  // this.im = imCanny
  // return

  let contours = imCanny.findContours()
  let threshold = 1
  let ids = []
  // console.log(contours.size())
  for (let i = 0; i < contours.size(); i++) {
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

  let markers = []
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

    pos.x = Math.round(pos.x)
    pos.y = Math.round(pos.y)
    markers.push(pos)
  }


  // console.log(positions)
  this.markers = markers
  this.socket.emit('markers:update', this.markers)
}

module.exports = detectMarkers
