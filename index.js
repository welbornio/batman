var port = 7337;
var net = require('net');
var server = net.createServer(handleNewSocket).listen(port);

var socketRegistry = [];
var userRegistry = [];

/**
 *
 * @param socket
 */
function handleNewSocket(socket) {
    socketRegistry.push(socket);
    socket.write('Welcome to the Batman chat server!\n');
    socket.on('data', function(data) {
        handleIncomingData(socket, data);
    });
    socket.on('end', function() {
        closeSocket(socket);
    });
    getLogin(socket);
}

/**
 * Get the login username for this user
 * @param socket
 */
function getLogin(socket) {
    socket.write('Login Name?');
}

/**
 * Parse incoming data from the client and check for commands, or distribute the message
 * @param socket
 * @param data
 */
function handleIncomingData(socket, data) {
    var text = cleanBuffer(data);
    var command;
    var user = getUser(socket);

    if(!user) {
        getLogin();
    }

    // Not a command
    if(text.charAt(0) !== '/') {
        return distributeMessage(text, user);
    }

    // Issuing a command
    command = text.split(' ')[0];
    switch(command) {
        case '/rooms':
            listRooms(socket, user);
            break;
        case '/join':
            joinRoom('derp', user);
            break;
        case '/leave':
            leaveRoom(socket, user);
            break;
        case '/quit':
            bootUser(socket, user);
            break;
        default:
            unknownCommand(socket, command);
            break;
    }
}

function getUser() {
    return 1;
}

/**
 * Close communication with user
 * @param socket User's socket
 * @param user User to be booted
 */
function bootUser(socket, user) {
    socket.end('BYE\n');
}

/**
 * Inform the user at this socket that they attempted an unknown command
 * @param socket Socket that attempted the command
 * @param command The attempted command
 */
function unknownCommand(socket, command) {
    socket.write('Unknown command: \'' + command + '\'\n');
}

/**
 * Remove a closed socket from our socket registry
 * @param socket Socket to be closed
 */
function closeSocket(socket) {
    var idx = socketRegistry.indexOf(socket);
    if(idx !== -1) {
        socketRegistry.splice(idx, 1);
        console.log('Removed socket from registry at index:', idx);
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
