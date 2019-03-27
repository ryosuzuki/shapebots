
const Mouse = {
  drawing: false,
  currentLine: { op: null, np: null },

  onMouseDown(event) {
    this.drawing = true
    let x = event.clientX
    let y = event.clientY
    let target = { x: x * 2, y: y * 2 }
    this.currentLine = {
      op: target,
      np: target
    }
    let line = this.calculateLine()
    let lines = App.state.lines
    if (lines.length === App.state.robots.length) {
      lines.shift()
    }
    lines.push(line)
    App.setState({ lines: lines })
  },

  onMouseMove(event) {
    if (!this.drawing) return false
    let x = event.clientX
    let y = event.clientY
    let target = { x: x * 2, y: y * 2 }
    this.currentLine.np = target
    let line = this.calculateLine()
    let lines = App.state.lines
    lines[lines.length-1] = line
    App.setState({ lines: lines })
  },

  onMouseUp(event) {
    this.drawing = false
  },

  calculateLine() {
    let op = this.currentLine.op
    let np = this.currentLine.np
    let center = {
      x: (op.x + np.x)/2,
      y: (op.y + np.y)/2
    }
    let v = {
      x: np.x - op.x,
      y: np.y - op.y
    }
    let len = Math.sqrt(v.x**2 + v.y**2)
    let angle = Math.atan2(v.x, v.y) * 180 / Math.PI
    angle = (-angle + 180) % 360
    let line = {
      op: op,
      np: np,
      v: v,
      center: center,
      len: len,
      angle: angle,
    }
    return line
  }

}

export default Mouse