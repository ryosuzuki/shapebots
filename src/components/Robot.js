import React, { Component } from 'react'

class Robot extends Component {
  constructor(props) {
    super(props)

    this.ratio = 1/2
    this.width = 30
    this.height = 30
    this.color = '#ddd'
    this.stroke = '#aaa'
  }

  onMouseDown() {
    console.log('mouse down')
  }

  render() {
    this.x = (this.props.x - this.width) * this.ratio
    this.y = (this.props.y - this.height) * this.ratio
    this.angle = this.props.angle
    this.len = this.props.len / 2

    let width = this.len
    let height = this.height - 10
    let x = (this.props.x - width) * this.ratio
    let y = (this.props.y - height) * this.ratio

    return(
      <g id={this.props.id}>
        <g
          className="block"
          onMouseDown={this.onMouseDown.bind(this)}
        >
          <rect
            transform={
              `translate(${x}, ${y}) rotate(${this.angle}, ${width/2}, ${height/2})`
            }
            width={ width }
            height={ height }
            fill={ this.color }
            stroke={ this.stroke }
            strokeWidth="3"
          />
          <rect
            transform={
              `translate(${this.x}, ${this.y}) rotate(${this.angle}, ${this.width/2}, ${this.height/2})`
            }
            width={ this.width }
            height={ this.height }
            fill={ this.color }
            stroke={ this.stroke }
            strokeWidth="3"
          />

          <rect
            transform={ `translate(${this.x},${this.y})  rotate(${this.angle}, ${this.width/2}, ${this.height/2})`}
            width="10"
            height="10"
            fill="#f00"
          />
          <text x={this.x + 5} y={this.y - 10} className="label">
            id: {this.props.id}
          </text>
          <text x={this.x + 5} y={this.y + 10} className="label">
            x: {parseInt(this.props.x)}, y: {parseInt(this.props.y)}
          </text>
          <text x={this.x + 5} y={this.y + 30} className="label">
            angle: {parseInt(this.props.angle)}
          </text>
        </g>
      </g>
    )
  }
}

export default Robot
