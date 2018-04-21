from firebase import firebase
firebase = firebase.FirebaseApplication('https://friendlychat-d891b.firebaseio.com/', None)
new_user = 'kgigklg'

firebase.post('/beneatass', data = new_user, headers = ['random'] )

