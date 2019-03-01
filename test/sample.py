import sys, json

count = 0

while True:
  res = { "result": "hello world" }
  print(json.dumps(res))
  count = count + 1
  if count > 1000:
    break

print(json.dumps("finish"))
