// Dependencies and constants.
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

exports.createModel = function (modelName) {
    // Schema
    var sessionSchema = new Schema({
        user: { type: Schema.Types.ObjectId, ref: 'User' }
    });

    return mongoose.model(modelName, sessionSchema);
};