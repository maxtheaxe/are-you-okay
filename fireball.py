from firebase import firebase
firebase = firebase.FirebaseApplication('https://friendlychat-d891b.firebaseio.com/', None)
new_user = '123456'

x = '10'
y = '10'
z = '8/10/20'
xx = '8:20'

firebase.post('/xcol', data = x, headers = {'name' : x} )

firebase.post('/ycol', data = y, headers = {'name' : y} )

firebase.post('/date', data = z, headers = {'name' : z} )

firebase.post('/time', data = xx, headers = {'name' : xx} )
