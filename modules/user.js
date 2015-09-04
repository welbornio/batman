var userRegistry = [];

module.exports = {
    /**
     * Create a user with the socket that just connected
     * @param socket
     * @returns {{name: null, socket: *}} User object
     */
    createUser: function(socket) {
        var user = new User(socket);
        userRegistry.push(user);
        return user;
    },

    /**
     * Determine if username is taken
     * @param name Name we're testing for
     * @returns {boolean} If name is available
     */
    checkNameAvailability: function(name) {
        var i;
        for(i = 0; i < userRegistry.length; i++) {
            if(userRegistry[i].name === name) {
                return false;
            }
        }
        return true;
    },

    /**
     * Remove a user from the registry
     * @param user User to be removed
     */
    removeUser: function(user) {
        var i;
        for(i = 0; i < userRegistry.length; i++) {
            if(userRegistry[i] === user) {
                userRegistry.splice(i, 1);
                console.log('Removed user from registry at index:', i);
            }
        }
    }
};

/**
 * User constructor
 * @param socket Socket for this user
 * @constructor
 */
function User(socket) {
    this.socket = socket;
    this.name = null;
    this.room = null;
}

/**
 * Set the user name
 * @param name New name
 */
User.prototype.setName = function(name) {
    this.name = name;
};

/**
 * Return the username
 * @returns {string|null} User name
 */
User.prototype.getName = function() {
    return this.name;
};

/**
 * Set the room for this user
 * @param room Room name
 */
User.prototype.setRoom = function(room) {
    this.room = room;
};

/**
 * Get the user room name
 * @returns {string|null} Room name this user is in
 */
User.prototype.getRoom = function() {
    return this.room;
};

/**
 * Remove user from room
 */
User.prototype.leaveRoom = function() {
    this.room = null;
};

/**
 * Notify a user of something
 * @param msg Message
 */
User.prototype.notify = function(msg) {
    this.socket.write(msg + '\n');
};

/**
 * Close a socket with a message
 * @param msg Message
 */
User.prototype.end = function(msg) {
    this.socket.end(msg + '\n');
};