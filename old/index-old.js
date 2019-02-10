var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var cv = require('opencv');
var center_of_marker = {};
var window;

// var USE_ARDUINO = true;
var USE_ARDUINO = false;

function detector(){
  try {
    var camera = new cv.VideoCapture(1);
    window = new cv.NamedWindow('Video', 0);

    setInterval(function() {
      camera.read(function(err, im) {
        if (err) throw err;
        // console.log(im.size())
        if (im.size()[0] > 0 && im.size()[1] > 0){
          // window.show(im);
          var im2 = new cv.Matrix(im.width(),im.height());
          im2 = im.clone();
          // findRedMarkerPoint(im);
          // findContour(im2);
          findRect(im)
        }
        window.blockingWaitKey(0, 50);
      });
    }, 200);

  } catch (e){
    console.log("Couldn't start camera:", e)
  }
}

function findRect(im) {
  let imCanny = im.copy()
  // imCanny.convertHSVscale()
   imCanny.cvtColor('CV_BGR2GRAY');
  let val = 240 // white
  let min = [val, val, val]
  let max = [255, 255, 255]
  imCanny.inRange(min, max)
  imCanny.erode(1)
  imCanny.dilate(10)

  let contours = imCanny.findContours()
  let threshold = 8000 // * 100
  let positions = []
  for (let i = 0; i < contours.size(); i++) {
    if (contours.area(i) < threshold) continue
    let arcLengh = contours.arcLength(i, true)
    let epsilon = 0.1 * arcLengh
    let isColsed = true
    contours.approxPolyDP(i, epsilon, isColsed)

    if (contours.cornerCount(i) !== 4) continue

    let count = contours.cornerCount(i)
    let pos = { x: 0, y: 0 }
    for (let j = 0; j < count; j++) {
      let point = contours.point(i, j)
      pos.x += point.x
      pos.y += point.y
    }
    pos.x /= count
    pos.y /= count
    positions.push(pos)
  }
  console.log(positions)
  io.emit('positions', positions);


  window.show(imCanny)
}



function findContour(im){
  im.cvtColor('CV_BGR2GRAY');
  let val = 240
  var lower_threshold = [val, val, val]; //bright room
  // var lower_threshold = [40, 40, 40]; //dark room
  var upper_threshold = [255,255,255];
  im.inRange(lower_threshold, upper_threshold);
  // im.bitwiseNot(im);
  window.show(im);
  var contours = im.findContours();
  for(var c = 0; c < contours.size(); ++c) {
    var rect= contours.minAreaRect(c)
    if(rect.size.height>100 && rect.size.height>100){
      var data = Object.assign(rect, center_of_marker);
      // console.log(data);
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


if(USE_ARDUINO){
  var SerialPort = require("serialport");
  var sport = new SerialPort("/dev/tty.usbmodem1451",
    {
      baudRate: 115200,
    }
    );

  function write_to_arduino(angle,distance){
    command = "{\"angle\":\""+angle+"\",\"distance\":\""+distance+"\"}\n";
    console.log(command);
    sport.write(command , function(err,bytesWritten){
      if(err){
        return console.log('Error: ',err.message);
      }
    });
  }

  sport.on('open', function () {
    console.log("serial port open");
  });

  sport.on('data', function (data) {
    console.log('Received: ' + data);
  });
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

  detector();

  socket.on('update_position', function(data){
    if(USE_ARDUINO){
      write_to_arduino(data.angle, data.distance);
    }
  });
});


http.listen(port, function(){
  console.log('listening on *:' + port);
});