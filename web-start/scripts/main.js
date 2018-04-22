/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var x_val;
var y_val;
var show_map = false;
var buttonArray, dateArray, timeArray, xArray, yArray


// Initializes FriendlyChat.
function FriendlyChat() {
  this.checkSetup();

  // Shortcuts to DOM Elements.
  this.messageList = document.getElementById('messages');
  this.messageForm = document.getElementById('message-form');
  this.messageInput = document.getElementById('message');
  this.submitButton = document.getElementById('submit');
  this.submitImageButton = document.getElementById('submitImage');
  this.imageForm = document.getElementById('image-form');
  this.mediaCapture = document.getElementById('mediaCapture');
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');

  // Saves message on form submit.
  this.messageForm.addEventListener('submit', this.saveMessage.bind(this));
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  // Toggle for the button.
  var buttonTogglingHandler = this.toggleButton.bind(this);
  this.messageInput.addEventListener('keyup', buttonTogglingHandler);
  this.messageInput.addEventListener('change', buttonTogglingHandler);

  // Events for image upload.
  this.submitImageButton.addEventListener('click', function(e) {
    e.preventDefault();
    this.mediaCapture.click();
  }.bind(this));
  this.mediaCapture.addEventListener('change', this.saveImageMessage.bind(this));

  this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
// Sets up shortcuts to Firebase features and initiate firebase auth.
FriendlyChat.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

// Loads chat messages history and listens for upcoming ones.
FriendlyChat.prototype.loadMessages = function() {
  // Reference to the /date/ database path.
  this.messagesRef = this.database.ref('button');
  // Make sure we remove all previous listeners.
  this.messagesRef.off();

  firebase.database().ref('/button_status').on('value', function(snapshot) {
      buttonArray = snapshotToArray(snapshot);
      console.log('buton', buttonArray);
  });

  firebase.database().ref('/date').on('value', function(snapshot) {
      dateArray = snapshotToArray(snapshot);
      console.log('date', dateArray);
  });

  firebase.database().ref('/time').on('value', function(snapshot) {
      timeArray = snapshotToArray(snapshot);
      console.log('time', timeArray);
  });

  firebase.database().ref('/xcol').on('value', function(snapshot) {
      xArray = snapshotToArray(snapshot);
      console.log('x', xArray);
  });

  firebase.database().ref('/ycol').on('value', function(snapshot) {
      yArray = snapshotToArray(snapshot);
      console.log('y', yArray);
  });

  // Loads the last date value
  var setMessage = function(data) {
    var val = data.val();
    this.displayMessage(data.key, 'button', val, val.photoUrl, val.imageUrl);
  }.bind(this);
  this.messagesRef.limitToLast(1).on('child_added', setMessage);
  this.messagesRef.limitToLast(1).on('child_changed', setMessage);

  // Reference to the /date/ database path.
  this.messagesRef = this.database.ref('date');
  // Make sure we remove all previous listeners.
  this.messagesRef.off();

  // Loads the last date value
  var setMessage = function(data) {
    var val = data.val();
    this.displayMessage(data.key, 'date', val, val.photoUrl, val.imageUrl);
  }.bind(this);
  this.messagesRef.limitToLast(1).on('child_added', setMessage);
  this.messagesRef.limitToLast(1).on('child_changed', setMessage);

  // Reference to the /time/ database path.
  this.messagesRef = this.database.ref('time');

  // Loads the last 12 messages and listen for new ones.
  var setMessage = function(data) {
    var val = data.val();
    this.displayMessage(data.key, 'time', val, val.photoUrl, val.imageUrl);
  }.bind(this);
  this.messagesRef.limitToLast(1).on('child_added', setMessage);
  this.messagesRef.limitToLast(1).on('child_changed', setMessage);

  // Reference to the /xcol/ database path.
  this.messagesRef = this.database.ref('xcol');

  // Loads the last 12 messages and listen for new ones.
  var setMessage = function(data) {
    var val = data.val();
    if(show_map && (val != x_val)){
      mymap(val, y_val);
    }
    x_val = val;
    this.displayMessage(data.key, 'xcol', val, val.photoUrl, val.imageUrl);
  }.bind(this);
  this.messagesRef.limitToLast(1).on('child_added', setMessage);
  this.messagesRef.limitToLast(1).on('child_changed', setMessage);

  // Reference to the /ycol/ database path
  this.messagesRef = this.database.ref('ycol');

  // Loads the last 12 messages and listen for new ones.
  var setMessage = function(data) {
    var val = data.val();
    y_val = val;
    this.displayMessage(data.key, 'ycol', val, val.photoUrl, val.imageUrl);
  }.bind(this);
  this.messagesRef.limitToLast(1).on('child_added', setMessage);
  this.messagesRef.limitToLast(1).on('child_changed', setMessage);

  if(timeArray == null){
    timeArray = [new Date()]
  }
  else{
    timeArray.push(new Date())
  }

  log_data();

};

// Saves a new message on the Firebase DB.
FriendlyChat.prototype.saveMessage = function(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (this.messageInput.value ) {

    var currentUser = this.auth.currentUser;
    // Add a new message entry to the Firebase Database.
    this.messagesRef.push({
      name: currentUser.displayName,
      text: this.messageInput.value,
      photoUrl: currentUser.photoURL || '/images/profile_placeholder.png'
    }).then(function() {
      // Clear message text field and SEND button state.
      FriendlyChat.resetMaterialTextfield(this.messageInput);
      this.toggleButton();
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });

  }
};

// Sets the URL of the given img element with the URL of the image stored in Cloud Storage.
// Sets the URL of the given img element with the URL of the image stored in Cloud Storage.
FriendlyChat.prototype.setImageUrl = function(imageUri, imgElement) {
  // If the image is a Cloud Storage URI we fetch the URL.
  if (imageUri.startsWith('gs://')) {
    imgElement.src = FriendlyChat.LOADING_IMAGE_URL; // Display a loading image first.
    this.storage.refFromURL(imageUri).getMetadata().then(function(metadata) {
      imgElement.src = metadata.downloadURLs[0];
    });
  } else {
    imgElement.src = imageUri;
  }
};

// Saves a new message containing an image URI in Firebase.
// This first saves the image in Firebase storage.
FriendlyChat.prototype.saveImageMessage = function(event) {
  event.preventDefault();
  var file = event.target.files[0];

  // Clear the selection in the file picker input.
  this.imageForm.reset();

  // Check if the file is an image.
  if (!file.type.match('image.*')) {
    var data = {
      message: 'You can only share images',
      timeout: 2000
    };
    this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
    return;
  }
  // Check if the user is signed-in
  //if (this.checkSignedInWithMessage()) {

    // We add a message with a loading icon that will get updated with the shared image.
    var currentUser = this.auth.currentUser;
    this.messagesRef.push({
      name: currentUser.displayName,
      imageUrl: FriendlyChat.LOADING_IMAGE_URL,
      photoUrl: currentUser.photoURL || '/images/profile_placeholder.png'
    }).then(function(data) {

      // Upload the image to Cloud Storage.
      var filePath = currentUser.uid + '/' + data.key + '/' + file.name;
      return this.storage.ref(filePath).put(file).then(function(snapshot) {

        // Get the file's Storage URI and update the chat message placeholder.
        var fullPath = snapshot.metadata.fullPath;
        return data.update({imageUrl: this.storage.ref(fullPath).toString()});
      }.bind(this));
    }.bind(this)).catch(function(error) {
      console.error('There was an error uploading a file to Cloud Storage:', error);
    });

  //}
};

// Signs-in Friendly Chat.
FriendlyChat.prototype.signIn = function() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);
};

// Signs-out of Friendly Chat.
FriendlyChat.prototype.signOut = function() {
  // Sign out of Firebase.
  this.auth.signOut();
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
FriendlyChat.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
    // Get profile pic and user's name from the Firebase user object.
    var profilePicUrl = user.photoURL; // Only change these two lines!
    var userName = user.displayName;   // Only change these two lines!

    // Set the user's profile pic and name.
    this.userPic.style.backgroundImage = 'url(' + profilePicUrl + ')';
    this.userName.textContent = userName;

    // Show user's profile and sign-out button.
    this.userName.removeAttribute('hidden');
    this.userPic.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');

    // Hide sign-in button.
    this.signInButton.setAttribute('hidden', 'true');

    // We load currently existing chant messages.
    this.loadMessages();

    // We save the Firebase Messaging Device token and enable notifications.
    this.saveMessagingDeviceToken();
  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');

    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
  }
};

// Returns true if user is signed-in. Otherwise false and displays a message.
FriendlyChat.prototype.checkSignedInWithMessage = function() {
  // Return true if the user is signed in Firebase
  return true;
};

// Saves the messaging device token to the datastore.
FriendlyChat.prototype.saveMessagingDeviceToken = function() {
  firebase.messaging().getToken().then(function(currentToken) {
    if (currentToken) {
      console.log('Got FCM device token:', currentToken);
      // Saving the Device Token to the datastore.
      firebase.database().ref('/fcmTokens').child(currentToken)
          .set(firebase.auth().currentUser.uid);
    } else {
      // Need to request permissions to show notifications.
      this.requestNotificationsPermissions();
    }
  }.bind(this)).catch(function(error){
    console.error('Unable to get messaging token.', error);
  });
};

// Requests permissions to show notifications.
FriendlyChat.prototype.requestNotificationsPermissions = function() {
  console.log('Requesting notifications permission...');
  firebase.messaging().requestPermission().then(function() {
    // Notification permission granted.
    this.saveMessagingDeviceToken();
  }.bind(this)).catch(function(error) {
    console.error('Unable to get permission to notify.', error);
  });
};

// Resets the given MaterialTextField.
FriendlyChat.resetMaterialTextfield = function(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
};

// Template for messages.
FriendlyChat.MESSAGE_TEMPLATE =
    '<div class="message-container">' +
      '<div class="spacing"><div class="pic"></div></div>' +
      '<div class="message"></div>' +
      '<div class="name"></div>' +
    '</div>';

// A loading image URL.
FriendlyChat.LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif';

// Displays a Message in the UI.
FriendlyChat.prototype.displayMessage = function(key, name, text, picUrl, imageUri) {
  var div = document.getElementById(key);
  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = FriendlyChat.MESSAGE_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', key);
    this.messageList.appendChild(div);
  }
  if (picUrl) {
    div.querySelector('.pic').style.backgroundImage = 'url(' + picUrl + ')';
  }
  div.querySelector('.name').textContent = name;
  var messageElement = div.querySelector('.message');
  if (text) { // If the message is text.
    messageElement.textContent = text;
    // Replace all line breaks by <br>.
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
  } else if (imageUri) { // If the message is an image.
    var image = document.createElement('img');
    image.addEventListener('load', function() {
      this.messageList.scrollTop = this.messageList.scrollHeight;
    }.bind(this));
    this.setImageUrl(imageUri, image);
    messageElement.innerHTML = '';
    messageElement.appendChild(image);
  }
  // Show the card fading-in.
  setTimeout(function() {div.classList.add('visible')}, 1);
  this.messageList.scrollTop = this.messageList.scrollHeight;
  this.messageInput.focus();
};

// Enables or disables the submit button depending on the values of the input
// fields.
FriendlyChat.prototype.toggleButton = function() {
  if (this.messageInput.value) {
    this.submitButton.removeAttribute('disabled');
  } else {
    this.submitButton.setAttribute('disabled', 'true');
  }
};

// Checks that the Firebase SDK has been correctly setup and configured.
FriendlyChat.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
};

window.onload = function() {
  window.friendlyChat = new FriendlyChat();
};


function snapshotToArray(snapshot) {
    var returnArr = [];

    snapshot.forEach(function(childSnapshot) {
        var item = childSnapshot.val();

        returnArr.push(item);
    });

    return returnArr;
};

function read_arrays(label){
  array = firebase.database().ref('/' + label).on('value', function(snapshot) {
          var arr = snapshotToArray(snapshot);
          console.log(label, arr);
          // alert(arr);
          return arr;
        });
  return array;
}

// writes arrays to log
function log_data(){

    alert(read_arrays('xcol'));

    // alert(xArray.length);
    //
    // var lengths = [xArray.length, yArray.length];
    // var min_length = Math.min.apply(null, lengths);
    // var table = document.getElementById('table');
    // var masterArray = [xArray.slice(min_length), yArray.slice(min_length)];
    //
    // console.log('masterArray' + masterArray);
    // for(var i = 0; i < table.rows.length; i++)
    // {
    //     // row cells
    //     for(var j = 1; j < table.rows[i].cells.length; j++)
    //     {
    //       table.rows[i].cells[j].innerHTML = masterArray[0][0];
    //     }
    //
    // }

    alert(xArray[0]);

    var table = document.getElementById('table');
    table.rows[0].cells[1].innerHTML = xArray[0];

}


// Set the date we're counting down to
var distance = 3000;
// Update the count down every 1 second
var x = setInterval(function() {

    // Get todays date and time
    var now = new Date().getTime();

    // Find the distance between now an the count down date
    //var distance = countDownDate - now;
    distance = distance - 1000;

    // document.getElementById("distance").innerHTML = distance

    // Time calculations for days, hours, minutes and seconds

    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Output the result in an element with id="demo"
    document.getElementById("distance").innerHTML = hours + "h "
    + minutes + "m " + seconds + "s ";

    // If the count down is over, write some text
    if (distance < 0) {
        document.getElementById("Title").style.display = "none";
        clearInterval(x);
        document.getElementById("distance").innerHTML = 'Current Location';
        show_map = true;
        mymap(x_val, y_val);
    }
}, 1000);


function reset(){
  show_map = false;
  distance = 3000;
}

document.getElementById('table')
// Creates a map
function mymap(x, y) {
  var myCenter = new google.maps.LatLng(x, y);
  var mapCanvas = document.getElementById("map");
  var mapOptions = {center: myCenter, zoom: 16};
  var map = new google.maps.Map(mapCanvas, mapOptions);
  var marker = new google.maps.Marker({position:myCenter});
  marker.setMap(map);
}


function generate_interactive_table(){
  document.getElementById("test").innerHTML = '23';
  var table = document.getElementById("table"),rIndex,cIndex;

      // table rows
      for(var i = 1; i < table.rows.length; i++)
      {
          // row cells
          for(var j = 0; j < table.rows[i].cells.length; j++)
          {
              table.rows[i].cells[j].onclick = function()
              {
                  rIndex = this.parentElement.rowIndex;
                  cIndex = this.cellIndex+1;
                  document.getElementById("test").innerHTML = "Row : "+rIndex+" , Cell : "+cIndex;
              };
          }
      }
}

function default_mymap(){
  mymap(x_val, y_val);
}

// generate onlick functions for tables
var table = document.getElementById("table"),rIndex,cIndex;
// table rows
for(var i = 1; i < table.rows.length; i++)
{
    // row cells
    for(var j = 0; j < table.rows[i].cells.length; j++)
    {
        table.rows[i].cells[j].onclick = function()
        {
            rIndex = this.parentElement.rowIndex;
            cIndex = this.cellIndex;
            // document.getElementById("test").innerHTML = "Row : "+rIndex+" , Cell : "+cIndex;

            // var objCells = table.rows.item(rIndex).cells;
            // curr_lat = objCells.item(1);
            // curr_long = objCells.item(2);
            // document.getElementById("test").innerHTML = table.rows[i].cells[j].childNodes[0].value;
            // alert(table.rows[rIndex].cells[cIndex].innerHTML)
            var curr_lat = parseFloat(table.rows[rIndex].cells[1].innerHTML);
            var curr_long = parseFloat(table.rows[rIndex].cells[2].innerHTML);
            // alert(table.rows[rIndex].cells[0].innerHTML);
            document.getElementById("test").innerHTML = "Row : "+curr_lat+" , Cell : "+curr_long;
            mymap(curr_lat, curr_long)
        };
    }
}
