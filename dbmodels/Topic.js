var moment = require('moment'),
    marked = require('marked'),
    ObjectId = require('mongoose-simpledb').Types.ObjectId;

exports.schema = {
    _id: Number,
    creator: { type: ObjectId, ref: 'User' },
    title: String,
    body: String,
    date: { type: Date, default: Date.now },
    editedDate: Date,
    editedBy: { type: ObjectId, ref: 'User' },
    tags: [String],
    commentCount: { type: Number, default: 0 },
    views: [
        {
            userId: { type: ObjectId, ref: 'User' },
            commentCount: { type: Number, default: 0 }
        }
    ],
    lastCommentDate: { type: Date, default: Date.now }
};

exports.methods = {
    dateFromNow: function () {
        return moment(this.date).fromNow();
    },
    editedDateFromNow: function () {
        return moment(this.date).fromNow();
    },
    bodyHtml: function () {
        return marked(this.body);
    }
};