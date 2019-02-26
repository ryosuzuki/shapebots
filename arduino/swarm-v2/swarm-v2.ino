#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <WiFiUDP.h>
#include <ArduinoJson.h>
#include "./config.h"

WiFiUDP UDP;
char packetBuffer[255];

int localPort = 8883;
int remotePort = 8884;

int cnt = 0;

// Custom
int a1 = 16;
int a2 = 14;
int b1 = 5;
int b2 = 4;

int c1 = 0;
int c2 = 2;
int d1 = 13;
int d2 = 15;

IPAddress myIP;

void setup() {
  pinMode (a1, OUTPUT );
  pinMode (a2, OUTPUT );
  pinMode (b1, OUTPUT );
  pinMode (b2, OUTPUT );

  Serial.begin (9600);
  delay(10);

  // Connect WiFi
  Serial.println();
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
}

void loop() {
  UDP.beginPacket(myIP, remotePort);
  UDP.write("ok");
  UDP.endPacket();
  delay(1000);
  
//  int packetSize = UDP.parsePacket();
//  if (packetSize) {
//    int len = UDP.read(packetBuffer, packetSize);
//    if (len > 0) packetBuffer[len] = '\0';
//
//    String json = packetBuffer;
//    StaticJsonBuffer<200> jsonBuffer;
//    JsonObject& root = jsonBuffer.parseObject(json);
//
//    int duration = root["duration"];
//    Serial.println(duration);
//
//    if (root["a1"] > 0) digitalWrite(a1, HIGH);
//    if (root["a2"] > 0) digitalWrite(a2, HIGH);
//    if (root["b1"] > 0) digitalWrite(b1, HIGH);
//    if (root["b2"] > 0) digitalWrite(b2, HIGH);
//
//    delay(duration);
//    off();
//
//  }
}
