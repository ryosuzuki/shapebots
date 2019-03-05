#ifndef CONFIG_H
#define CONFIG_H

static const char *ssid = "Ryo Suzuki";
static const char *password = "ryotomomi";

int localPort = 8883;

// swarm-v2
int a1 = 0;  // D3
int a2 = 2;  // D4
int b1 = 13; // D7
int b2 = 15; // D8

int c1 = 16; // D0 
int c2 = 14; // D5
int d1 = 5;  // D1
int d2 = 4;  // D2

int s1 = 12; // D6
//#define s2 A0;   // 

/*
// swarm-v1
int a1 = 5;
int a2 = 4;
int b1 = 16;
int b2 = 14;

// swarm-v2
int a1 = 16;
int a2 = 14;
int b1 = 5;
int b2 = 4;

// test board
int a1 = 5;
int a2 = 4;
int b1 = 16;
int b2 = 14;

int c1 = 5;
int c2 = 4;
int d1 = 16;
int d2 = 14;
*/

#endif
