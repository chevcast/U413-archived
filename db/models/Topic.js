var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

exports.createSchema = function () {
    var topicSchema = new Schema({
        _id: Number,
        creator: { type: Schema.Types.ObjectId, ref: 'User' },
        title: String,
        body: String,
        date: { type: Date, default: Date.now },
        editedDate: Date,
        editedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        tags: [String],
        commentCount: { type: Number, default: 0 },
        lastCommentDate: { type: Date, default: Date.now }
    });
    return topicSchema;
};