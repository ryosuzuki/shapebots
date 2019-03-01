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
int current = 0;
int maximum = 800;

void setup() {
  pinMode (a1, OUTPUT);
  pinMode (a2, OUTPUT);
  pinMode (b1, OUTPUT);
  pinMode (b2, OUTPUT);

  pinMode (c1, OUTPUT);
  pinMode (c2, OUTPUT);
  pinMode (d1, OUTPUT);
  pinMode (d2, OUTPUT);

  pinMode(s1, INPUT);

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

void initialize() {
  while(true) {
    down();
    if (digitalRead(s1) != 0) {
       break;
    }
  }
  current = 0;
}

void actuate(int pos) {
  if (pos > current) {
    while(true) {
      if (current >= pos || current >= maximum) {
        break;
      }
      up();
      current = current + 1;
      Serial.println(current);
      delay(1);
    }
  } else {
    while(true) {
      if (current <= pos) {
        break;
      }
      if (digitalRead(s1) != 0) {
        pause();
        delay(100);
        up();
        delay(300);
        current = 0;
        break;
      }
      down();
      current = current - 1;
      Serial.println(current);
      delay(1);
    }
  }
}

void up() {
  digitalWrite(c1, LOW);
  digitalWrite(c2, HIGH);
  digitalWrite(d1, LOW);
  digitalWrite(d2, HIGH);
}

void down() {
  digitalWrite(c1, HIGH);
  digitalWrite(c2, LOW);
  digitalWrite(d1, HIGH);
  digitalWrite(d2, LOW);
}

void pause() {
  digitalWrite(c1, HIGH);
  digitalWrite(c2, HIGH);
  digitalWrite(d1, HIGH);
  digitalWrite(d2, HIGH);
}

void loop() {

  int packetSize = UDP.parsePacket();
  if (packetSize) {
    int len = UDP.read(packetBuffer, packetSize);
    if (len > 0) packetBuffer[len] = '\0';

    String json = packetBuffer;
    StaticJsonBuffer<200> jsonBuffer;
    JsonObject& root = jsonBuffer.parseObject(json);

    int duration = root["duration"];
    int pos = root["pos"];

    if (duration) {
      if (root["a1"] > 0) digitalWrite(a1, HIGH);
      if (root["a2"] > 0) digitalWrite(a2, HIGH);
      if (root["b1"] > 0) digitalWrite(b1, HIGH);
      if (root["b2"] > 0) digitalWrite(b2, HIGH);
      delay(duration);
      off();
    }

    if (pos) {
      actuate(pos);
      off();
    }

    /*
    UDP.beginPacket("0.0.0.0", 8884);
    UDP.write("ok");
    UDP.endPacket();
    */

  }


}