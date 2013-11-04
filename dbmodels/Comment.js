var ObjectId = require('mongoose').Schema.Types.ObjectId,
    marked = require('marked'),
    moment = require('moment');

exports.schema = {
    _id: Number,
    creator: { type: ObjectId, ref: 'User' },
    topic: { type: Number, ref: 'Topic' },
    body: String,
    date: { type: Date, default: Date.now },
    editedDate: Date,
    editedBy: { type: ObjectId, ref: 'User' }
};

exports.methods = {
    dateFromNow: function () {
        return moment(this.date).fromNow();
    },
    editedDateFromNow: function () {
        return moment(this.editedDate).fromNow();
    },
    bodyHtml: function () {
        return marked(this.body);
    }
};