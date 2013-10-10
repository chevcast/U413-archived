var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

exports.createSchema = function () {
    var sessionSchema = new Schema({
        user: { type: Schema.Types.ObjectId, ref: 'User' }
    });
    return sessionSchema;
};