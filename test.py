import socket
import json
from getkey import getkey, keys

forward = { 'a1': 1, 'a2': 0, 'b1': 0, 'b2': 1, 'duration': 100 }
backward = { 'a1': 0, 'a2': 1, 'b1': 1, 'b2': 0, 'duration': 100 }
right = { 'a1': 0, 'a2': 1, 'b1': 0, 'b2': 1, 'duration': 100 }
left = { 'a1': 1, 'a2': 0, 'b1': 1, 'b2': 0, 'duration': 100 }

client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
ip = '10.0.0.105'
port = 8883

while True:
  key = getkey()
  command = None
  if key is keys.UP:
    command = forward
    print('up')
  elif key is keys.DOWN:
    command = backward
    print('down')
  elif key is keys.LEFT:
    command = left
    print('left')
  elif key is keys.RIGHT:
    command = right
    print('right')
  elif key is keys.ESC:
    break
  else:
    print('press arrow key')

  if command:
    message = json.dumps(command).encode()
    client.sendto(message, (ip, port))


