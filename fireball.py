from firebase import firebase
firebase = firebase.FirebaseApplication('https://testing-97c52.firebaseio.com/users', None)
result = firebase.get('/users', '1')
print result
