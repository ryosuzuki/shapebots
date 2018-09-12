import React, { Component } from 'react'

class Robot extends Component {
  constructor(props) {
    super(props)
  }

  onMouseDown() {
    console.log('mouse down')
  }

  render() {
    return(
      <g id={this.props.id}>
        <g
          className="block"
          onMouseDown={this.onMouseDown.bind(this)}
        >
          <rect
            transform={
              `translate(${this.props.x},${this.props.y}) rotate(${this.props.angle})`
            }
            width="50"
            height="50"
            fill="#ddd"
            stroke="#fff"
            strokeWidth="3"
          />
          <text x={this.props.x + 5} y={this.props.y - 10} className="label">
            id: {this.props.id}
          </text>
          <text x={this.props.x + 5} y={this.props.y + 10} className="label">
            x: {this.props.x}, y: {this.props.y}
          </text>
          <text x={this.props.x + 5} y={this.props.y + 30} className="label">
            angle: {this.props.angle}
          </text>
        </g>
      </g>
    )
  }
}

export default Robot
