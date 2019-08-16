
# Using Plugin

  

### Welcome

>

> No matter if you are a beginner or an advanced user, starting with AVS is easy.

### Features

- Screen Sharing

- STUN/TURN Server

- and much more coming ....

### Library

  

Just download the current version of the compiled file:

  

-  [/dist/avs.min.js](https://github.com/meoknu/avs-plugin/raw/master/dist/avs.min.js) - Distributed version - compiled and minified. We will use this single javascript file in our webpage.

### Include JS

  

Include `avs.min.js` into the footer.

The path may vary according to the directory you have downloaded the file in.

```html
<script  src="avs.min.js"></script>
```

### Call the plugin

  

Now call the AVS initializer function and your screen sharing module is ready.

  

```javascript
var  avs = new  AVS({
	wss:  "http://wss.olecons.com", // Your Socket Server URL
	videoElem:  document.getElementById('stream'), // HTML Element where you want to stream video
	iceConfig: {
		iceTransportPolicy: 'relay', // this will force your users to be connected to turn server instead of relay, (option), not using this property will enable p2p connections
		iceServers: [
			{
				urls: ['stun:coturn.olecons.com'] // stun url of the coturn server
			},
			{
				urls: ['turns:coturn.olecons.com'], // turns url of the coturn server
				username:  'username', // your turn username
				credential:  'password'  // your turn password
			}
		]
	}
});

```

  

All people who are connected to the ***AVS*** in same room, can exchange data over WebRTC. One person in the room, can start sharing his screen with other peers, by issuing `shareScreen()` method of the `avs` instance.

```javascript

avs.shareScreen();

```

This will start sharing screen of the peer with other peers.
