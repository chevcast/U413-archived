exports.schema = {
    username: String,
    email: String,
    password: String,
    joinDate: { type: Date, default: Date.now },
    lastActiveDate: { type: Date, default: Date.now },
    lastSocketId: String,
    roles: [String]
};

exports.methods = {
    isModOrAdmin: function () {
        return this.roles.indexOf('mod') + this.roles.indexOf('admin') != -2;
    }
};