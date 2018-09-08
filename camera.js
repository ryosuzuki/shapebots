var cv = require('opencv');

try {
  var camera = new cv.VideoCapture(0);
  var window = new cv.NamedWindow('Video', 0)

  setInterval(function() {
    camera.read(function(err, im) {
      if (err) throw err;
      console.log(im.size())
      if (im.size()[0] > 0 && im.size()[1] > 0){
        // window.show(im);
         findContour(im); 
      }
      // window.blockingWaitKey(0, 50);
    });
  }, 33);
  
} catch (e){
  console.log("Couldn't start camera:", e)
}

function findContour(im){
  im.cvtColor('CV_BGR2GRAY');
  var lower_threshold = [230, 230, 230];
  var upper_threshold = [255,255,255];
  im.inRange(lower_threshold, upper_threshold);
  im.bitwiseNot(im);
  var contours = im.findContours();
  // Access vertex data of contours
  for(var c = 0; c < contours.size(); ++c) {
    console.log("Contour " + c);
    var rect= contours.minAreaRect(c)
    console.log(rect);
    // for(var i = 0; i < contours.cornerCount(c); ++i) {
    //   var point = contours.point(c, i);
    //   console.log("(" + point.x + "," + point.y + ")");
    // }
  }
}

