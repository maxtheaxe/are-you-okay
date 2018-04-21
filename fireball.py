from firebase import firebase
firebase = firebase.FirebaseApplication('https://friendlychat-d891b.firebaseio.com/', None)
new_user = 'kgigklg'

firebase.put('/beneatass/xloc', new_user)

