var roomRegistry = [];
roomRegistry.push(new Room('chat'));

module.exports = {
    /**
     * Create a room
     * @param name Name of room
     */
    createRoom: function(name) {
        if(this.getRoomByName(name)) {
            return false;
        }
        var room = new Room(name);
        roomRegistry.push(room);
        return true;
    },

    /**
     * Distribute message to room
     * @param user User sending message
     * @param name Room name
     * @param msg Message
     * @param adminMessage Whether or not this is an administrative message
     */
    distributeMessage: function(user, name, msg, adminMessage) {
        var room = this.getRoomByName(name);
        room.distributeMessage(user, msg, adminMessage);
    },

    /**
     * List the available rooms and their member counts
     */
    getRoomList: function() {
        var i;
        var msg = 'Active rooms are:\n';

        for(i = 0; i < roomRegistry.length; i++) {
            msg += '* ' + roomRegistry[i].name + ' (' + roomRegistry[i].members.length + ')\n';
        }

        msg += 'end of list.';

        return msg;
    },

    /**
     * Get a room by its name
     * @param name Name of room
     */
    getRoomByName: function(name) {
        var i;
        for(i = 0; i < roomRegistry.length; i++) {
            if(roomRegistry[i].name === name) {
                return roomRegistry[i];
            }
        }
        return false;
    }
};

/**
 * Room constructor
 * @param name Name of the room
 * @constructor
 */
function Room(name) {
    this.name = name;
    this.members = [];
}

/**
 * Add a user to the member list for this room
 * @param user User to be added
 */
Room.prototype.addMember = function(user) {
    var msg = '* new user joined chat: ' + user.getName();
    this.distributeMessage(user, msg);
    this.members.push(user);
    user.notify('entering room: ' + this.name);
    user.setRoom(this.name);
};

/**
 * Distribute message to room users
 * @param user User sending message
 * @param msg Message
 * @param adminMessage Whether or not this is an admin message
 */
Room.prototype.distributeMessage = function(user, msg, adminMessage) {
    var i;
    var msgCopy;

    for(i = 0; i < this.members.length; i++) {
        msgCopy = msg;
        if(adminMessage === true && this.members[i] === user) {
            msgCopy += ' (** this is you)';
        }
        this.members[i].notify(msgCopy);
    }
};

/**
 * Remove user from room
 * @param user User to be removed
 */
Room.prototype.removeUser = function(user) {
    var i;
    var msg = '* user has left chat: ' + user.getName();
    this.distributeMessage(user, msg, true);

    for(i = 0; i < this.members.length; i++) {
        if(this.members[i] === user) {
            this.members.splice(i, 1);
        }
    }
};

/**
 * List members for this room
 */
Room.prototype.getMemberList = function() {
    var i;
    var msg = '';

    for(i = 0; i < this.members.length; i++) {
        msg += '* ' + this.members[i].name;
        if(this.members[i] === user) {
            msg += ' (** this is you)';
        }
        msg += '\n';
    }
    msg += 'end of list.';

    return msg;
};