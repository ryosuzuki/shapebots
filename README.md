# Swarm Robots
Software and hardware for simple swarm robots

# Installation

```
git clone git@github.com:ryosuzuki/swarm.git
```

Use Node v10.15.1 and Python v3.7.2

```
nodebrew install-binary v10.15.1
nodebrew use v10.15.1
```

```
pyenv install 3.7.2
```

```
$ node -v
v10.15.1

$ python --version
Python 3.7.2
```

If you get an error like "zlib not available" on macOS Mojave, then enter the following command at the terminal (See [this issue](https://github.com/pyenv/pyenv/issues/1219#issuecomment-448658430))

```
$ export LDFLAGS="-L/usr/local/opt/zlib/lib"
$ export CPPFLAGS="-I/usr/local/opt/zlib/include"
$ export LDFLAGS="-L/usr/local/opt/zlib/lib -L/usr/local/opt/sqlite/lib"
$ export CPPFLAGS="-I/usr/local/opt/zlib/include -I/usr/local/opt/sqlite/include"
```

## Install OpenCV

```
brew tap homebrew/science
brew install opencv
```

```
pip install opencv-python
pip install tornado
pip install opencv-contrib-python
```

Test OpenCV in Python console
```
python
>>> import cv2
>>> cv2.__version__
'4.0.0'
```

# Setup

Use an external webcam, so in `/track/index.js`, we use `1` for the camera id. Use `0` for the internal camera.

```js
this.camera = new cv.VideoCapture(1) // <- for webcam
```

Also, the default set up is `background: black, robots: white`.
Change the parameter in each file, if you want to change it.


# Start
Run `server.py` in one tab
```
python server.py
```

and run `websocket dev server` in another tab
```
npm start
```

Then, you can access to http://localhost:8080/
