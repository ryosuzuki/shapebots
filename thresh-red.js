var cv = require('opencv');

// var camera = new cv.VideoCapture(0);
// var window = new cv.NamedWindow('Video', 0)

// camera.read(function(err, im) {
//   if (err) throw err;
//   console.log(im.size())
//   if (im.size()[0] > 0 && im.size()[1] > 0){
//     im.save('cap.jpg');
//     findContour(im); 
//   }
//   window.blockingWaitKey(0, 50);
// });

cv.readImage('cap2.jpg', function(err, im){
  findRedMarkerPoint(im); 
});

function findRedMarkerPoint(im){
  im.cvtColor('CV_BGR2GRAY');
  var lower_threshold = [0,0, 0]; 
  // var upper_threshold = [60,100,255];
  var upper_threshold = [60,80,255];
  im.inRange(lower_threshold, upper_threshold);
  im.save('thresh.jpg');
  im.bitwiseNot(im);
  im.save('red.jpg');
  var contours = im.findContours();
  // Access vertex data of contours
  for(var c = 0; c < contours.size(); ++c) {
    var rect= contours.minAreaRect(c)
    if(rect.size.height<50 && rect.size.height< 10){ 
      computeCenterOfGravity(rect.points);
    }
  }
};

function computeCenterOfGravity(points){
          sumx = 0;
          sumy = 0;
          for(var i=0;i<points.length;i++){
            sumx += points[i].x;
            sumy += points[i].y;
          }
          cgx = sumx / points.length;
          cgy = sumy / points.length;
          console.log(cgx,cgy);
}
