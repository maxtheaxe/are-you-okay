from firebase import firebase
firebase = firebase.FirebaseApplication('https://friendlychat-8cd27.firebaseapp.com/', None)
new_user = '19248.23405'



result = firebase.post('/test/xloc', new_user)
print result
