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
int s2 = A0; // A0
//#define s2 A0 // A0

/*       
 *       2     1
 * G V D1 D2 C2 C1
 * ---------------
 * TX          RST
 * RX          A0 
 * D1          D0
 * D2          D5
 * D3          D6
 * D4          D7
 * G           D8
 * 5V          3V3
 * ---------------
 *    |      |  
 *     ------
 */

#endif
