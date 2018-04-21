from firebase import firebase
firebase = firebase.FirebaseApplication('https://testing-97c52.firebaseio.com/users', None)
new_user = 'Ozgur Vatansever'

result = firebase.post('/users', new_user)
print result
