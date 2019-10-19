#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <WiFiUDP.h>
#include <ArduinoJson.h>
#include "config.h"

WiFiUDP UDP;
IPAddress myIP;

char packetBuffer[255];
int cnt = 0;

int current_1 = 0;
int current_2 = 0;
int dir_1 = 0;
int dir_2 = 0;

int pos_1 = 0;
int pos_2 = 0;

void setup() {
  pinMode (a1, OUTPUT);
  pinMode (a2, OUTPUT);
  pinMode (b1, OUTPUT);
  pinMode (b2, OUTPUT);

  pinMode (c1, OUTPUT);
  pinMode (c2, OUTPUT);
  pinMode (d1, OUTPUT);
  pinMode (d2, OUTPUT);

  pinMode(s1, INPUT_PULLUP);
  pinMode(s2, INPUT_PULLUP);

  Serial.begin (9600);
  delay(10);

  // Connect WiFi
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.hostname("Name");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");

  // Print the IP address
  Serial.print("IP address: ");
  Serial.print(WiFi.localIP());
  Serial.println();
  Serial.println();

  if (MDNS.begin("esp8266")) {
    Serial.println ("MDNS responder started");
  }

  myIP = WiFi.localIP();
  Serial.print("AP IP address: ");
  Serial.println(myIP);
  UDP.begin(localPort);
  off();
}

void loop() {

  int packetSize = UDP.parsePacket();
  if (packetSize) {
    int len = UDP.read(packetBuffer, packetSize);
    if (len > 0) packetBuffer[len] = '\0';

    String json = packetBuffer;
    StaticJsonBuffer<200> jsonBuffer;
    JsonObject& root = jsonBuffer.parseObject(json);

    int reset_1 = root["reset_1"];
    int reset_2 = root["reset_2"];
    if (reset_1 > 0) {
      current_1 = 0;
    }
    if (reset_2 > 0) {
      current_2 = 0;
    }      

    int init_1 = root["init_1"];
    int init_2 = root["init_2"];
    if (init_1 > 0) {
      Serial.println("init_1");
      initialize(1);
    }
    if (init_2 > 0) {
      Serial.println("init_2");
      initialize(2);
    }

    pos_1 = root["pos_1"];
    pos_2 = root["pos_2"];

    Serial.println(pos_1);
    Serial.println(pos_2);

    if (pos_1) {
      if (pos_1 >= current_1) {
        dir_1 = 1;
      } else {
        dir_1 = -1;      
      }
    }
    if (pos_2) {
      if (pos_2 >= current_2) {
        dir_2 = 1;
      } else {
        dir_2 = -1;
      }  
    }
    
    analogWrite(a1, root["a1"]);
    analogWrite(a2, root["a2"]);
    analogWrite(b1, root["b1"]);
    analogWrite(b2, root["b2"]);

    int ms = root["ms"];
    if (ms > 0) {
      delay(ms);
      analogWrite(a1, 0);
      analogWrite(a2, 0);
      analogWrite(b1, 0);
      analogWrite(b2, 0);      
    }
    
  }

  if (dir_1 == 0) {
    stop(1);
  }
  if (dir_2 == 0) {
    stop(2);
  }

  if (dir_1 > 0) {
    up(1);
    current_1 = current_1 + 1;
    if (current_1 >= pos_1) {
      dir_1 = 0;
    }
  } 
  if (dir_1 < 0) {
    down(1); 
    current_1 = current_1 - 1;
    if (current_1 < pos_1) {
      dir_1 = 0;
    }
    if (digitalRead(s1) == 0) {
      pause(1);
      delay(100);
      up(1);
      delay(500);
      current_1 = 0;
      dir_1 = 0;
      stop(1);
    }    
  }

  if (dir_2 > 0) {
    up(2);
    current_2 = current_2 + 1;
    if (current_2 >= pos_2) {
      dir_2 = 0;
    }
  } 
  if (dir_2 < 0) {
    down(2);
    current_2 = current_2 - 1;
    if (current_2 < pos_2) {
      dir_2 = 0;
    }
    if (map(analogRead(s2), 0, 1023, 0, 1) == 0) {
      pause(2);
      delay(100);
      up(2);
      delay(500);
      current_2 = 0;
      dir_2 = 0;
      stop(2);
    }
  }

  delay(1);
}

void off() {
  digitalWrite(a1, LOW);
  digitalWrite(a2, LOW);
  digitalWrite(b1, LOW);
  digitalWrite(b2, LOW);

  digitalWrite(c1, LOW);
  digitalWrite(c2, LOW);
  digitalWrite(d1, LOW);
  digitalWrite(d2, LOW);
}

void initialize(int num) {
  while (true) {
    down(num);
    delay(1);
    if (digitalRead(s1) == 0) {
      pause(num);
      delay(100);
      up(num);
      delay(500);
      current_1 = 0;
      off();
      break;
    }
    if (map(analogRead(s2), 0, 1023, 0, 1) == 0) {
      pause(num);
      delay(100);
      up(num);
      delay(500);
      current_2 = 0;
      off();      
      break;
    }    
  }
}

void up(int num) {
  if (num == 1) {
    digitalWrite(c1, LOW);
    digitalWrite(c2, HIGH);
  } else {
    digitalWrite(d1, LOW);
    digitalWrite(d2, HIGH);
  }
}

void down(int num) {
  if (num == 1) {
    digitalWrite(c1, HIGH);
    digitalWrite(c2, LOW);
  } else {
    digitalWrite(d1, HIGH);
    digitalWrite(d2, LOW);
  }
}

void stop(int num) {
  if (num == 1) {
    digitalWrite(c1, LOW);
    digitalWrite(c2, LOW);
  } else {
    digitalWrite(d1, LOW);
    digitalWrite(d2, LOW);
  }
}

void pause(int num) {
  if (num == 1) {
    digitalWrite(c1, HIGH);
    digitalWrite(c2, HIGH);
  } else {
    digitalWrite(d1, HIGH);
    digitalWrite(d2, HIGH);
  }
}
