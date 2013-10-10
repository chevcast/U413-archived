var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    autoIncrement = require('mongoose-auto-increment');

exports.createSchema = function () {
    var topicSchema = new Schema({
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
    topicSchema.plugin(autoIncrement, 'Topic');
    return topicSchema;
};