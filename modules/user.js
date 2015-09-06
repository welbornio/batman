var userRegistry = [];

module.exports = {
    /**
     * Get a user by their username
     * @param name
     */
    getUserByName: function(name) {
        var i;
        for(i = 0; i < userRegistry.length; i++) {
            if(userRegistry[i].getName() === name) {
                return userRegistry[i];
            }
        }
        return false;
    },

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
    },

    /**
     * List all active members
     * @param user Requesting user
     */
    getUserList: function(user) {
        var i;
        var msg = 'All active users:\n';
        for(i = 0; i < userRegistry.length; i++) {
            msg += userRegistry[i].getName();
            if(userRegistry[i] === user) {
                msg += ' (** this is you)';
            }
            msg += '\n';
        }
        msg += 'end of list.';

        return msg;
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
    this.recentPM = null;
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
 * Send private message to this user
 * @param user User sending message
 * @param message Message
 */
User.prototype.sendPrivateMessage = function(user, message) {
    var msg = '**PRIVATE** (' + user.getName() + ' => ' + this.name + '): ' + message;
    this.setRecentPM(user.getName());
    this.notify(msg);
    user.notify(msg);
};

/**
 * Set the most recent person to PM this user
 */
User.prototype.setRecentPM = function(name) {
    this.recentPM = name;
};

/**
 * Get the name of the most recent user to PM this user
 */
User.prototype.getRecentPM = function() {
    return this.recentPM;
};

/**
 * Notify a user of something
 * @param msg Message
 */
User.prototype.notify = function(msg) {
    if(this.socket.writable) {
        this.socket.write(msg + '\n');
    }
};

/**
 * Close a socket with a message
 * @param msg Message
 */
User.prototype.end = function(msg) {
    if(this.socket.writable) {
        this.socket.end(msg + '\n');
    }
};