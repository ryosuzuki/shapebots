var cv = require('opencv');
var camera = new cv.VideoCapture(0);
var window = new cv.NamedWindow('Video', 0)

camera.read(function(err, im) {
  if (err) throw err;
  console.log(im.size())
  if (im.size()[0] > 0 && im.size()[1] > 0){
    im.save('cap.jpg');
  }
});

