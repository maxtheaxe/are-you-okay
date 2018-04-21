from firebase import firebase
firebase = firebase.FirebaseApplication('https://cbb-hackathon.firebaseio.com/', None)
result = firebase.get('/users', None)
print result
