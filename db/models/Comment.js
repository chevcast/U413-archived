var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    autoIncrement = require('mongoose-auto-increment');

exports.createSchema = function () {
    var commentSchema = new Schema({
        creator: { type: Schema.Types.ObjectId, ref: 'User' },
        topic: { type: Number, ref: 'Topic' },
        body: String,
        date: { type: Date, default: Date.now },
        editedDate: Date,
        editedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    });
    commentSchema.plugin(autoIncrement, 'Comment');
    return commentSchema;
};