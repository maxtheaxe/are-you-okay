from firebase import firebase
firebase = firebase.FirebaseApplication('https://your_storage.firebaseio.com', None)
new_user = 'Ozgur Vatansever'

result = firebase.post('/messages', new_user)
print result
