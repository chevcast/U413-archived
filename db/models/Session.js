// Dependencies and constants.
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

exports.createSchema = function () {
    // Schema
    var sessionSchema = new Schema({
        user: { type: Schema.Types.ObjectId, ref: 'User' }
    });

    return sessionSchema;
};