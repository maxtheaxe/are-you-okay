from firebase import firebase
firebase = firebase.FirebaseApplication('https://cbb-hackathon.firebaseio.com/', None)
new_user = '19248.23405'

result = firebase.post('/users', new_user)
print result
