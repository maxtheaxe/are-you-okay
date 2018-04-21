from firebase import firebase
firebase = firebase.FirebaseApplication('https://friendlychat-d891b.firebaseio.com/', None)
new_user = 'Ozgur Vatansever'

result = firebase.post('/beneatass', new_user)
print result
