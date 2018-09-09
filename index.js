var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var cv = require('opencv');
var center_of_marker = {};
var window;

// var SerialPort = require("serialport");
// var port = new SerialPort("/dev/tty.usbmodem1451", 
//   {
//     baudRate: 115200,
//   }
// );

function detector(){
  try {
    var camera = new cv.VideoCapture(0);
    window = new cv.NamedWindow('Video', 0);

    setInterval(function() {
      camera.read(function(err, im) {
        if (err) throw err;
        console.log(im.size())
        if (im.size()[0] > 0 && im.size()[1] > 0){
          // window.show(im);
          var im2 = new cv.Matrix(im.width(),im.height());
          im2 = im.clone();
          findRedMarkerPoint(im);
          findContour(im2); 
        }
        window.blockingWaitKey(0, 50);
      });
    }, 200);

  } catch (e){
    console.log("Couldn't start camera:", e)
  }
}

function findContour(im){
  im.cvtColor('CV_BGR2GRAY');
  var lower_threshold = [70, 70, 70]; //bright room
  // var lower_threshold = [40, 40, 40]; //dark room
  var upper_threshold = [255,255,255];
  im.inRange(lower_threshold, upper_threshold);
  im.bitwiseNot(im);
  window.show(im);
  var contours = im.findContours();
  for(var c = 0; c < contours.size(); ++c) {
    var rect= contours.minAreaRect(c)
    if(rect.size.height>100 && rect.size.height>100){ 
    	var data = Object.assign(rect, center_of_marker);
    	console.log(data);
    	io.emit('update_browser', data);
    // console.log("Contour " + c);
    // console.log(rect);
	}
  }
}

function findRedMarkerPoint(im){
  im.cvtColor('CV_BGR2GRAY');
  var lower_threshold = [0,0, 0]; 
  // var upper_threshold = [60,100,255];
  var upper_threshold = [60,80,255];
  im.inRange(lower_threshold, upper_threshold);
  im.bitwiseNot(im);
  var contours = im.findContours();
  // Access vertex data of contours
  for(var c = 0; c < contours.size(); ++c) {
    var rect= contours.minAreaRect(c)
    if(rect.size.height<50 && rect.size.height>10){ 
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
  // console.log(cgx,cgy);
  center_of_marker = {marker_x: cgx, marker_y: cgy};
}

// function write_to_arduino(angle,distance){
//   command = "{\"angle\":\""+angle+"\",\"distance\":\""+distance+"\"}\n";
//   console.log(command);
//   port.write(command , function(err,bytesWritten){
//     if(err){
//       return console.log('Error: ',err.message);
//     }
//   });
// }

// port.on('open', function () {
//   console.log("serial port open");
// });

// port.on('data', function (data) {
//   console.log('Received: ' + data);
// });

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

  detector();

  socket.on('update_position', function(data){
    // write_to_arduino(data.angle, data.distance); 
  });
});


http.listen(port, function(){
  console.log('listening on *:' + port);
});
