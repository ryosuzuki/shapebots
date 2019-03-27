import base64
import os
import sys
import json
import time
import random
import socket

import numpy as np
import tornado
from tornado import websocket, web, ioloop
import tornado.autoreload

import cv2
from cv2 import aruco

client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

fps = 30
cameras = [0] # [0, 2]

class HttpHandler(web.RequestHandler):
  def get(self):
    self.render('./index.html')

  def set_extra_headers(self, path):
    self.set_header('Cache-control', 'no-cache')

class SocketHandler(websocket.WebSocketHandler):
  def initialize(self):
    self.state = True

  def open(self):
    self.caps = []
    for camera in cameras:
      cap = cv2.VideoCapture(camera)
      cap.set(cv2.CAP_PROP_FPS, fps)
      w = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
      h = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
      print(w, h)
      self.caps.append(cap)
    print(self.request.remote_ip, ': connection opened')
    self.ioloop = tornado.ioloop.IOLoop.instance()
    self.send()

  def send(self):
    period = 1 / fps
    self.ioloop.add_timeout(time.time() + period, self.send)
    if self.ws_connection:
      i = 0
      results = []
      for camera in cameras:
        self.caps[i]
        result = self.capture(i)
        results.append(result)
      message = json.dumps(results)
      self.write_message(message)

  def capture(self, i):
    ret, frame = self.caps[i].read()
    dictionary, parameters = self.config()
    corners, ids, rejectedImgPoints = aruco.detectMarkers(frame, dictionary, parameters=parameters)
    frame = aruco.drawDetectedMarkers(frame, corners, ids, borderColor=(0, 0, 255))
    frame = aruco.drawDetectedMarkers(frame, rejectedImgPoints, borderColor=(0, 255, 0))
    frame = cv2.resize(frame, (int(frame.shape[1]/2), int(frame.shape[0]/2)))
    frame = cv2.flip(frame, 1)
    ret, buffer = cv2.imencode('.jpg', frame)
    image = base64.b64encode(buffer).decode('utf-8')
    if ids is None:
      ids = np.array([])
    ids = ids.tolist()
    corners = np.array(corners)
    corners = corners.tolist()
    result = {
      'ids': ids,
      'corners': corners,
      'image': image,
    }
    return result

  def on_message(self, message):
    message = json.loads(message)
    ip = message['ip']
    port = message['port']
    command = message['command']
    command = json.dumps(command).encode()
    client.sendto(command, (ip, port))

  def on_close(self):
    for cap in self.caps:
      cap.release()
    cv2.destroyAllWindows()
    self.state = False
    self.close()
    print(self.request.remote_ip, ': connection closed')

  def check_origin(self, origin):
    return True

  def config(self):
    dictionary_name = aruco.DICT_4X4_50
    dictionary = aruco.getPredefinedDictionary(dictionary_name)

    parameters = aruco.DetectorParameters_create()
    # Thresholding
    parameters.adaptiveThreshWinSizeMin = 3 # >= 3
    parameters.adaptiveThreshWinSizeStep = 10 # 10
    parameters.adaptiveThreshConstant = 7 # 7
    # Contour Filtering
    parameters.minMarkerPerimeterRate = 0.03 # 0.03
    parameters.maxMarkerPerimeterRate = 0.1 # 4.0
    parameters.minCornerDistanceRate = 0.2 # 0.05
    parameters.minMarkerDistanceRate = 0.3 # 0.05
    parameters.minDistanceToBorder = 5 # 3
    # Bits Extraction
    parameters.markerBorderBits = 1 # 1
    parameters.minOtsuStdDev = 5.0 # 5.0
    parameters.perspectiveRemoveIgnoredMarginPerCell = 0.4 # 0.13
    # parameters.perpectiveRemovePixelPerCell = 10 # 4
    # Marker Identification
    parameters.maxErroneousBitsInBorderRate = 0.6 # 0.35
    parameters.errorCorrectionRate = 2.8 # 0.6

    return dictionary, parameters

def main():
  app = tornado.web.Application([
    (r'/', HttpHandler),
    (r'/ws', SocketHandler),
  ], static_path='build', debug=True)
  print('start web server at localhost:8080')
  app.listen(8080)
  tornado.ioloop.IOLoop.current().start()

if __name__ == '__main__':
  main()

