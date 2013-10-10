var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

exports.createSchema = function () {
    var commentSchema = new Schema({
        _id: Number,
        creator: { type: Schema.Types.ObjectId, ref: 'User' },
        topic: { type: Number, ref: 'Topic' },
        body: String,
        date: { type: Date, default: Date.now },
        editedDate: Date,
        editedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    });
    return commentSchema;
};