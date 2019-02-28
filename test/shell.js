const { PythonShell } = require('python-shell')
const shell = new PythonShell('./camera.py', {
  mode: 'text'
})

shell.on('message', data => {
  console.log(data)
})

shell.end()

// PythonShell.run('./test/opencv.py', null, (err, results) => {
//   if (err) throw err
//   console.log('finished')
// })