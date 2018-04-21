from firebase import firebase
firebase = firebase.FirebaseApplication('https://friendlychat-d891b.firebaseio.com/', None)
new_user = '123456'


x = 11
y = 11
z = '8/20/20'
xx = '8:21'

while True:

  x+=1
  y+=1

  firebase.post('/xcol', data = x, headers = {'name' : x} )

  firebase.post('/ycol', data = y, headers = {'name' : y} )

  firebase.post('/date', data = z, headers = {'name' : z} )

  firebase.post('/time', data = xx, headers = {'name' : xx} )
