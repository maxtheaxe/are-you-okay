from firebase import firebase
firebase = firebase.FirebaseApplication('https://testing-4f663.firebaseio.com/', None)
result = firebase.get('/users', '1')
print result
