var cv = require('opencv');

cv.readImage('foo.jpg', function(err, im){
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
    for(var i = 0; i < contours.cornerCount(c); ++i) {
      var point = contours.point(c, i);
      console.log("(" + point.x + "," + point.y + ")");
    }
  }
  im.save('./out.jpg');
})
