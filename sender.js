var sleep = require('sleep');

var SerialPort = require("serialport");
// const Readline = SerialPort.parsers.Readline;
var port = new SerialPort("/dev/tty.usbmodem1451", 
  {
    baudRate: 115200,
  }
);

port.on('open', function () {
  console.log("serial port open");
  sleep.sleep(5);
  console.log("sending");
  sendDestination(30,10);
});

port.on('data', function (data) {
  console.log('Received: ' + data);
});

function sendDestination(angle,distance){
  command = "{\"angle\":\""+angle+"\",\"distance\":\""+distance+"\"}\n";
  console.log(command);
  port.write(command , function(err,bytesWritten){
    if(err){
      return console.log('Error: ',err.message);
    }
  });
}

// while(true){
//     console.log("sending");
//     sendDestination(30,10);
    // sleep.sleep(1);
// }
// 
