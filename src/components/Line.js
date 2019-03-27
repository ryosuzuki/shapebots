import React, { Component } from 'react'

class Line extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return(
      <g className="line" id={this.props.id}>
        <circle
          cx={this.props.op.x / 2}
          cy={this.props.op.y / 2}
          r="5"
          fill="red"
        />
        <circle
          cx={this.props.np.x / 2}
          cy={this.props.np.y / 2}
          r="5"
          fill="red"
        />
        <line
          x1={this.props.op.x / 2}
          y1={this.props.op.y / 2}
          x2={this.props.np.x / 2}
          y2={this.props.np.y / 2}
          stroke="red"
          strokeWidth="5"
        />
        <text x={this.props.center.x / 2 + 5} y={this.props.center.y / 2 - 10} className="label">
          x: { this.props.center.x }, y: { this.props.center.y }, angle: {Math.round(this.props.angle)} len: {Math.round(this.props.len)} id: { this.props.id }
        </text>

      </g>
    )
  }
}

export default Line
