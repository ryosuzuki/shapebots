#include <Arduino.h>
#include <String.h>
#include <ArduinoJson.h>

void setup(){

  Serial.begin(115200);    
  while (!Serial) {
    // wait serial port initialization
  }
  Serial.println("Serial initialized.");
  delay(500);
  pinMode(13,OUTPUT);
}

void loop()
{
  String response;
  bool begin = false;
  bool end = false;

  while (!end) {
    if (Serial.available() > 0)
    {
      begin = true;
      response = Serial.readStringUntil('\n');
      // Serial.println(response);
      end = true;
    }
  }

  const char *charBuf = response.c_str();
  DynamicJsonBuffer jsonBuffer;
  JsonObject& root = jsonBuffer.parseObject(charBuf);
  if (!root.success()) {
    // Serial.println("parseObject() failed");
    return;
  }

  const char* angle = root["angle"];
  const char* distance = root["distance"];

  int a = atoi(angle);
  int b = atoi(distance);

  if(a==30&&b==10){
   for(int i=0;i<20;i++){
    digitalWrite(13,HIGH);
    delay(200);
    digitalWrite(13,LOW);
    delay(200);
   }
  }
//  Serial.print("angle:");
//  Serial.print(angle);
//  Serial.print(", destination:");
//  Serial.print(destination);
}

