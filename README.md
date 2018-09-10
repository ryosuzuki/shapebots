# ShapeBots
ShapeBots: Shape-changing Swarm Robots


# Installation

```
git clone git@github.com:ryosuzuki/shapebots.git
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



















