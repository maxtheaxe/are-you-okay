from firebase import firebase
firebase = firebase.FirebaseApplication('https://friendlychat-d891b.firebaseio.com/', None)
new_user = 'Ozgur Vatansever'

firebase.post('/beneatass', new_user)

