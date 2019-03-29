import Move from './Move'

const Animation = {

  add() {
    let targets = []
    for (let line of App.state.lines) {
      let target = {
        x: line.center.x,
        y: line.center.y,
        angle: line.angle,
        len: line.len
      }
      targets.push(target)
    }
    let keyframes = App.state.keyframes
    keyframes.push({ targets: targets, lines: App.state.lines })
    App.setState({ keyframes: keyframes })
  },

  save() {
    let name = window.prompt('Enter the file name', '');
    let json = {
      name: name,
      keyframes: App.state.keyframes
    }
    console.log(json)
    let str = JSON.stringify(json)
    const request = new XMLHttpRequest()
    request.open('POST', '/', true)
    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    request.send(str)
  },

  load() {
    const showOpenFileDialog = () => {
      return new Promise(resolve => {
        const input = document.createElement('input');
        input.type = 'file'
        input.accept = '.json, application/json'
        input.onchange = event => { resolve(event.target.files[0]) }
        input.click()
      })
    }

    const readAsText = file => {
      return new Promise(resolve => {
        const reader = new FileReader()
        reader.readAsText(file)
        reader.onload = () => { resolve(reader.result) }
      })
    }

    (async () => {
      const file = await showOpenFileDialog()
      const content = await readAsText(file)
      let json = JSON.parse(content)
      console.log(json)
      App.setState({ keyframes: json })
    })()
  },

  start(event) {
    let i = event.target.value
    let targets = App.state.keyframes[i].targets
    let lines = App.state.keyframes[i].lines

    App.setState({ targets: targets, lines: lines }, () => {
      Move.move()
    })
  }
}

export default Animation