import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from '../redux/actions'
import _ from 'lodash'

const socket = io.connect('http://localhost:8080/')

class App extends Component {
  constructor(props) {
    super(props)
    window.app = this
  }

  initPositions() {

  }

  checkFinish() {

  }

  updatePointer(pos) {

  }

  updateConstraints(positions) {

  }

  updatePanelMarkers(positions) {

  }

  componentDidMount() {

  }

  render() {
    return (
      <div>
        <h1>hello world</h1>
      </div>
    )
  }
}

window.addEventListener('resize', () => {
  // window.app.resize()
}, false)

function mapStateToProps(state) {
  return state
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
