var sleep = require('sleep');

var SerialPort = require("serialport");
const Readline = SerialPort.parsers.Readline;
var port = new SerialPort("/dev/tty.usbmodem1431", 
  {
    baudRate: 115200,
    parser: new Readline({delimiter:'\n'})
  }
);

port.on('open', function () {
  console.log("serial port open");
});

port.on('data', function (data) {
  console.log('Received: ' + data);
});

function sendDestination(angle,distance){
  command = "{\"angle\":\""+angle+"\",\"distance\":\""+distance+"\"}\n";
  port.write(command , function(err,bytesWritten){
    if(err){
      return console.log('Error: ',err.message);
    }
  });
}

function sendDump(){
  command = "{\"dump\":\""+"all"+"\"}\n"
  port.write(command, function(err,bytesWritten){
    if(err){
      return console.log('Error: ',err.message);
    }
  });
}

function Printer(){
  this.angle = '';
  this.distance = '';
}

var printer = new Printer();  

while(true){
    console.log("sending");
    sendDestination(30,10);
    sleep.sleep(1);
}

