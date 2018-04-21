from firebase import firebase
firebase = firebase.FirebaseApplication('https://testing-97c52.firebaseio.com/users', None)
new_user = 'Ozgur Vatansever'

result = firebase.post('/users', new_user, {'print': 'pretty'}, {'X_FANCY_HEADER': 'VERY FANCY'})
print result
{u'name': u'-Io26123nDHkfybDIGl7'}
