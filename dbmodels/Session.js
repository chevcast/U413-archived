var ObjectId = require('mongoose-simpledb').Types.ObjectId;

exports.schema = {
    user: { type: ObjectId, ref: 'User' }
};