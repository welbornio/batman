var port = 7337;
var http = require('http');
var net = require('net');
var server = net.createServer(handleNewSocket).listen(port);

var userRegistry = [];

// Some default rooms
var roomRegistry = {
    'chat': {
        name: 'chat',
        members: []
    }
};

/**
 * Handle an incoming socket connection
 * @param socket
 */
function handleNewSocket(socket) {
    var user = createUser(socket);
    user.socket.write('Welcome to the Batman chat server!\n');
    user.socket.on('data', function(data) {
        handleIncomingData(user, data);
    });
    user.socket.on('end', function() {
        removeUser(user);
    });
    getLogin(user);
}

/**
 * Create a user with the socket that just connected
 * @param socket
 * @returns {{name: null, socket: *}} User object
 */
function createUser(socket) {
    var newUser = {
        name: null,
        room: null,
        socket: socket
    };
    userRegistry.push(newUser);
    return newUser;
}

/**
 * Get the login username for this user
 * @param user
 */
function getLogin(user) {
    user.socket.write('Login Name?\n');
}

/**
 * Welcome a new user with a message
 * @param user
 */
function welcomeUser(user) {
    user.socket.write('Welcome ' + user.name + '!\n');
}

/**
 * Parse incoming data from the client and check for commands, or distribute the message
 * @param user Speaking user
 * @param data Text from user
 */
function handleIncomingData(user, data) {
    var text = cleanBuffer(data);

    if(user.name === null) {
        attemptLogin(user, text) ? welcomeUser(user) : getLogin(user);
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
            listMembers(user);
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
            closeSocket(user);
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
    var i;
    for(i = 0; i < userRegistry.length; i++) {
        if(userRegistry[i].name === text) {
            user.socket.write('Sorry, name taken.\n');
            return false;
        } else if(text.charAt(0) === '/') {
            user.socket.write('Sorry, name cannot start with \'/\'\n');
            return false;
        }
    }
    user.name = text;
    return true;
}

/**
 * Distribute a message from one user to other users
 * @param user Speaking user
 * @param text Text message from user
 */
function distributeMessage(user, text) {
    var msg = user.name + ': ' + text;

    if(user.room !== null) {
        distributeRoomMessage(user, user.room, msg);
    }
}

/**
 * Close communication with user
 * @param user User to be booted
 */
function closeSocket(user) {
    if(user.room !== null) {
        leaveRoom(user);
    }
    user.socket.end('BYE\n');
    console.log('Closed socket for user:', user.name);
    removeUser(user);
}

/**
 * List rooms to a user
 * @param user Requesting user
 */
function listRooms(user) {
    var prop;
    user.socket.write('Active rooms are:\n');

    for(prop in roomRegistry) {
        user.socket.write('* ' + prop + ' (' + roomRegistry[prop].members.length + ')\n');
    }

    user.socket.write('end of list.\n');
}

/**
 * Join a room as a user
 * @param user User joining room
 * @param room Room name
 */
function joinRoom(user, room) {
    if(user.room !== null) {
        leaveRoom(user);
    }

    if(roomRegistry[room] === undefined) {
        user.socket.write('Room \'' + room + '\' does not exist\n');
    } else {
        user.socket.write('entering room: ' + room + '\n');
        distributeRoomMessage(user, room, '* new user joined chat: ' + user.name);
        user.room = room;
        roomRegistry[room].members.push(user);
        listMembers(user);
    }
}

/**
 * Create a new room
 * @param user User creating room
 * @param room Room name to be created
 */
function createRoom(user, room) {
    if(roomRegistry[room] === undefined) {
        roomRegistry[room] = {
            name: room,
            members: []
        };
        user.socket.write('Room \'' + room + '\' created!\n');
    } else {
        user.socket.write('Room already exists\n');
    }
}

/**
 * Remove a user from a room
 * @param user User to be removed
 */
function leaveRoom(user) {
    var i;
    var room;
    var msg;

    if(!user.room) {
        user.socket.write('You are not in a room\n');
        return;
    }

    msg = '* user has left chat: ' + user.name;
    distributeRoomMessage(user, user.room, msg, true);

    room = roomRegistry[user.room];
    for(i = 0; i < room.members.length; i++) {
        if(room.members[i] === user) {
            room.members.splice(i, 1);
        }
    }
    user.room = null;
}

/**
 * List room members
 * @param user User to be notified
 */
function listMembers(user) {
    var room;
    var i;
    var msg;
    if(user.room === null) {
        user.socket.write('You are not in a room\n');
        return;
    }

    room = roomRegistry[user.room];

    for(i = 0; i < room.members.length; i++) {
        msg = '* ' + room.members[i].name;
        if(room.members[i] === user) {
            msg += ' (** this is you)';
        }
        msg += '\n';
        user.socket.write(msg);
    }
    user.socket.write('end of list.\n');
}

/**
 * Notify room of a room action
 * @param user User who message is about
 * @param room Room name to be notified
 * @param msg Message to be distributed
 * @param adminMessage Is this an administrative message? Defaults to undefined/false
 */
function distributeRoomMessage(user, room, msg, adminMessage) {
    var i;
    var msgCopy;
    var members = roomRegistry[room].members;

    for(i = 0; i < members.length; i++) {
        msgCopy = msg;
        if(adminMessage === true && members[i] === user) {
            msgCopy += ' (** this is you)';
        }
        msgCopy += '\n';
        members[i].socket.write(msgCopy);
    }
}

/**
 * Inform the user at this socket that they attempted an unknown command
 * @param user User that attempted the command
 * @param command The attempted command
 */
function unknownCommand(user, command) {
    user.socket.write('Unknown command: \'' + command + '\'\n');
}

/**
 * Remove a closed socket from our socket registry
 * @param user User who disconnected
 */
function removeUser(user) {
    var i;
    for(i = 0; i < userRegistry.length; i++) {
        if(userRegistry[i] === user) {
            userRegistry.splice(i, 1);
            console.log('Removed user from registry at index:', i);
        }
    }
}

/**
 * Clean a buffer of newline and CR and convert it to a string
 * @param buffer Buffer to clean
 * @returns {string} Cleaned buffer as a string
 */
function cleanBuffer(buffer) {
    return buffer.toString().replace(/(\r\n|\n|\r)/gm, "");
}
