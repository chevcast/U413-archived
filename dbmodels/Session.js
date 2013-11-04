var ObjectId = require('mongoose').Schema.Types.ObjectId;

exports.schema = {
    user: { type: ObjectId, ref: 'User' }
};