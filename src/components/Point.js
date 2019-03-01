import React, { Component } from 'react'

class Point extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return(
      <g className="point" id={this.props.id}>
        <circle
          cx={this.props.x / 2}
          cy={this.props.y / 2}
          r="10"
          fill="red"
        />
        <text x={this.props.x / 2 + 5} y={this.props.y / 2 - 10} className="label">
          x: { this.props.x }, y: { this.props.y }, id: { this.props.id }
        </text>
      </g>
    )
  }
}

export default Point
