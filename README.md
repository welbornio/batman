# Batman
TCP-based chat server

### Running locally
You may need XCode if you do not already have it installed. [Download XCode here](https://itunes.apple.com/us/app/xcode/id497799835?mt=12).

Also ensure that you have Node.js and NPM installed. [Download Node.js here](http://nodejs.org).

You can also use Homebrew to install Node.js. [Download Homebrew here](http://brew.sh/).
```
brew install node
```

Once Node is installed, go ahead and clone into the repo.
```
git clone git@github.com:welbornio/batman.git
```
Once you have it downloaded, just jump into the directory, and start the server.
```
cd batman/
npm start
```
The server will be running on port 7337.

### Connecting to the server
```
telent [IP Address] [PORT]
```
If the server is running locally:
```
telnet 0.0.0.0 7337
```

### Commands Available
`/users` Lists all active users chatting on the server

`/w [name] [message]` Private message a user

`/r [message]` Reply to the most recent user that sent you a private message

`/rooms` List all the active rooms

`/create [name]` Create a room by name

`/join [name]` Join a room by name

`/members` List all the active members in your current room

`/leave` Leave the current room

`/quit` Quit chatting and exit the server

