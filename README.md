# Are You Okay?
A wifi-based tracker with dead man's switch created at Colby Bowdoin Bates Hackathon 2018, where it won the prize for "Best Use of Google Cloud Platform."

Concerned users can log into their account to see if their loved one is okay, and if they’ve missed the predefined amount of time without a check-in, their location is displayed live.

## Server-side (Google Firebase)
* Stores the location data in a realtime database (NoSQL)
* Checks for input to see if the person is okay
* Outputs the location data to website (only in the event that the user hasn't checked in in a pre-defined period of time)

## Client-side (Raspberry Pi)
* Runs a Python script to fetch location based off wifi access points ([initbrain's Python WiFi Positioning System](https://github.com/initbrain/Python-Wi-Fi-Positioning-System))
* Checks for button presses to indicate input, and therefore, the “all clear”
* Sends the location data to the Firebase via wifi (only to be displayed to authenticated users if check-ins are missed)

## Hardware
* Pi Zero W
* 2000 mAh Rechargeable LiPo Battery
* Powerboost 1000 Charger from Adafruit
* Momentary switch
* Plastic crayon box enclosure

![hardware picture](https://raw.githubusercontent.com/maxtheaxe/are-you-okay/master/smallerhardwarepic.jpg)
