from firebase import firebase
firebase = firebase.FirebaseApplication('https://friendlychat-d891b.firebaseio.com/', None)
new_user = '123456'

firebase.post('/beneatass', data = new_user, headers = {'random' : new_user} )

