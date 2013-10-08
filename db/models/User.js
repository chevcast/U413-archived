// Dependencies and constants.
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

exports.createModel = function (modelName) {
    // Schema
    var userSchema = new Schema({
        username: String,
        email: String,
        password: String,
        joinDate: { type: Date, default: Date.now },
        lastActiveDate: { type: Date, default: Date.now},
        roles: [String]
    });

    userSchema.method('isModOrAdmin', function () {
        return this.roles.indexOf('mod') + this.roles.indexOf('admin') != -2;
    });

    return mongoose.model(modelName, userSchema);
};