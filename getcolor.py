import cv2

#cap = cv2.VideoCapture(0)
#_, img = cap.read()
img = cv2.imread('cap.jpg')
cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

def detect(event,x,y,flags,param):
    print(img[x,y])

cv2.namedWindow("hoge")
cv2.setMouseCallback("hoge",detect)

cv2.imshow("hoge",img)
cv2.waitKey(0)
cv2.destroyAllWindows()

