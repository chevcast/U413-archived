// Dependencies and constants.
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

exports.createSchema = function () {
    var userSchema = new Schema({
        username: String,
        email: String,
        password: String,
        joinDate: { type: Date, default: Date.now },
        lastActiveDate: { type: Date, default: Date.now},
        lastSocketId: String,
        roles: [String]
    });

    userSchema.method('isModOrAdmin', function () {
        return this.roles.indexOf('mod') + this.roles.indexOf('admin') != -2;
    });

    return userSchema;
};