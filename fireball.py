from firebase import firebase
import json

firebase = firebase.FirebaseApplication('https://friendlychat-d891b.firebaseio.com/', None)
new_user = '19248.23405'

xloc = 'xloc'

data = {'xloc': new_user}
        
sent = json.dumps(data)

result = firebase.post('/xloc, new_user)
print result
