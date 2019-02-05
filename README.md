# Swarm Robots
Software and hardware for simple swarm robots

# Installation

```
git clone git@github.com:ryosuzuki/swarm.git
```

Use Node v8.11.4 and Python v2.7.8

```
nodebrew install-binary v8.11.4
```

```
pyenv install 2.7.8
```

```
$ node -v
v8.11.4

$ python --version
Python 2.7.8
```

## Install OpenCV

```
brew tap homebrew/science
brew install opencv@2
brew link --force opencv@2
```


Test if you can install opencv successfully
```
npm install opencv
```

When you get the following error like
```
npm install opencv fails with "node-pre-gyp install --fallback-to-build"
```

Then, this [link](https://github.com/peterbraden/node-opencv/issues/472) was helpful. I was able to soleve this issue with

```
brew uninstall --force opencv
brew reinstall opencv@2
brew link opencv@2 --force
```


# Setup

Use an external webcam, so in `/track/index.js`, we use `1` for the camera id. Use `0` for the internal camera.

```js
this.camera = new cv.VideoCapture(1) // <- for webcam
```

Also, the default set up is `background: black, robots: white`.
Change the parameter in each file, if you want to change it.


# Start
Run `server.js` in one tab
```
node server.js
```

and run `websocket dev server` in another tab
```
npm start
```

Then, you can access to http://localhost:8080/camera.
(I would recommend to use `nodemon` instead of `node` in the development state.)
