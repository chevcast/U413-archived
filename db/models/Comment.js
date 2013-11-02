var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    marked = require('marked'),
    moment = require('moment');

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
    commentSchema.virtual('dateFromNow').get(function () {
        return moment(this.date).fromNow();
    });
    commentSchema.virtual('editedDateFromNow').get(function () {
        return moment(this.editedDate).fromNow();
    });
    commentSchema.virtual('bodyHtml').get(function () {
        return marked(this.body);
    });
    return commentSchema;
};