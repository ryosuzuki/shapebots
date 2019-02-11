import cv2
from cv2 import aruco

cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FPS, 60)

dictionary_name = aruco.DICT_4X4_50
dictionary = aruco.getPredefinedDictionary(dictionary_name)

w = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
h = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
print(w, h)

while True:
  ret, frame = cap.read()

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

  corners, ids, rejectedImgPoints = aruco.detectMarkers(frame, dictionary, parameters=parameters)
  frame = aruco.drawDetectedMarkers(frame, corners, ids, borderColor=(0, 0, 255))
  frame = aruco.drawDetectedMarkers(frame, rejectedImgPoints, borderColor=(0, 255, 0))

  frame = cv2.resize(frame, (int(frame.shape[1]/2), int(frame.shape[0]/2)))
  cv2.imshow('Edited Frame', frame)

  k = cv2.waitKey(30)
  if k == 27:
    break

cap.release()
cv2.destroyAllWindows()