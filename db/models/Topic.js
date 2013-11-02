var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    marked = require('marked'),
    moment = require('moment');

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
        views: [
            {
                userId: { type: Schema.Types.ObjectId, ref: 'User' },
                commentCount: { type: Number, default: 0 }
            }
        ],
        lastCommentDate: { type: Date, default: Date.now }
    });
    topicSchema.virtual('dateFromNow').get(function () {
        return moment(this.date).fromNow();
    });
    topicSchema.virtual('editedDateFromNow').get(function () {
        return moment(this.editedDate).fromNow();
    });
    topicSchema.virtual('lastCommentDateFromNow').get(function () {
        return moment(this.lastCommentDate).fromNow();
    });
    topicSchema.virtual('bodyHtml').get(function () {
        return marked(this.body);
    });
    return topicSchema;
};