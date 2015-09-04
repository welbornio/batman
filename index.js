var port = 7337;
var http = require('http');
var net = require('net');
var server = net.createServer(handleNewSocket).listen(port);


// Batman modules
var User = require('./modules/user');
var Room = require('./modules/room');


/**
 * Handle an incoming socket connection
 * @param socket
 */
function handleNewSocket(socket) {
    var user = User.createUser(socket);
    user.notify('Welcome to the Batman chat server!');

    /**
     * Incoming socket
     */
    user.socket.on('data', function(data) {
        handleIncomingData(user, data);
    });

    /**
     * Socket abruptly ends
     */
    user.socket.on('end', function() {
        userDisconnected(user);
    });

    // Login the user
    getLogin(user);
}

/**
 * Ask the user for their username
 * @param user
 */
function getLogin(user) {
    user.notify('Login Name?');
}

/**
 * Welcome a new user with a message
 * @param user
 */
function welcomeUser(user) {
    user.notify('Welcome ' + user.getName() + '!');
}

/**
 * Parse incoming data from the client and check for commands, or distribute the message
 * @param user Speaking user
 * @param data Text from user
 */
function handleIncomingData(user, data) {
    var text = cleanBuffer(data);

    if(!user.getName()) {
        if(attemptLogin(user, text)) {
            welcomeUser(user);
        } else {
            getLogin(user);
        }
        return;
    }

    if(text.charAt(0) !== '/') {
        // Not a command
        distributeMessage(user, text);
    } else {
        // is a command
        handleCommand(user, text);
    }
}

/**
 * Handle a command from the user
 * @param user User issuing command
 * @param text Command and params
 */
function handleCommand(user, text) {
    var command = text.split(' ')[0];
    var param = text.split(' ')[1];
    switch(command) {
        case '/members':
            listRoomMembers(user);
            break;
        case '/rooms':
            listRooms(user);
            break;
        case '/join':
            joinRoom(user, param);
            break;
        case '/leave':
            leaveRoom(user);
            break;
        case '/create':
            createRoom(user, param);
            break;
        case '/quit':
            userExit(user);
            break;
        default:
            unknownCommand(user, command);
            break;
    }
}

/**
 * Attempt a login by checking for free username
 * @param user
 * @param text
 * @returns boolean If login was successful
 */
function attemptLogin(user, text) {
    if(text.charAt(0) === '/') {
        user.notify('Sorry, name cannot start with \'/\'');
        return false;
    }

    if(!User.checkNameAvailability(text)) {
        user.notify('Sorry, name taken.');
        return false;
    }

    user.setName(text);
    return true;
}

/**
 * Distribute a message from one user to other users
 * @param user Speaking user
 * @param text Text message from user
 */
function distributeMessage(user, text) {
    var msg = user.getName() + ': ' + text;
    var room = Room.getRoomByName(user.getRoom());

    if(room) {
        room.distributeMessage(user, msg);
    }
}

/**
 * Close communication with user
 * @param user User to be booted
 */
function userExit(user) {
    if(user.getRoom()) {
        leaveRoom(user);
    }
    user.end('BYE');
    console.log('Closed socket for user:', user.getName());
}

/**
 * Handle user that disconnected unexpectedly
 * @param user User who disconnected
 */
function userDisconnected(user) {
    if(user.getRoom()) {
        leaveRoom();
    }
    User.removeUser(user);
}

/**
 * List rooms to a user
 * @param user Requesting user
 */
function listRooms(user) {
    user.notify(Room.getRoomList());
}

/**
 * Join a room as a user
 * @param user User joining room
 * @param name Room name
 */
function joinRoom(user, name) {
    var room;

    if(user.getRoom()) {
        leaveRoom(user);
    }

    room = Room.getRoomByName(name);
    if(room) {
        room.addMember(user);
        listRoomMembers(user);
    } else {
        user.notify('Room \'' + room + '\' does not exist');
    }
}

/**
 * Create a new room
 * @param user User creating room
 * @param room Room name to be created
 */
function createRoom(user, room) {
    if(Room.createRoom(room)) {
        user.notify('Room \'' + room + '\' created!');
    } else {
        user.notify('Room already exists');
    }
}

/**
 * Remove a user from a room
 * @param user User to be removed
 */
function leaveRoom(user) {
    var room = Room.getRoomByName(user.getRoom());
    if(room) {
        room.removeUser(user);
        user.leaveRoom();
    } else {
        user.notify('You are not in a room');
    }

}

/**
 * List room members
 * @param user User to be notified
 */
function listRoomMembers(user) {
    var room = Room.getRoomByName(user.getRoom());
    if(room) {
        user.notify(room.getMemberList(user));
    } else {
        user.notify('You are not in a room');
    }
}

/**
 * Inform the user at this socket that they attempted an unknown command
 * @param user User that attempted the command
 * @param command The attempted command
 */
function unknownCommand(user, command) {
    user.notify('Unknown command: \'' + command + '\'');
}

/**
 * Clean a buffer of newline and CR and convert it to a string
 * @param buffer Buffer to clean
 * @returns {string} Cleaned buffer as a string
 */
function cleanBuffer(buffer) {
    return buffer.toString().replace(/(\r\n|\n|\r)/gm, "");
}
