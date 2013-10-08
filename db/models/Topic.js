var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    autoIncrement = require('mongoose-auto-increment');

exports.createModel = function (modelName) {
    var topicSchema = new Schema({
        creator: { type: Schema.Types.ObjectId, ref: 'User' },
        title: String,
        body: String,
        date: { type: Date, default: Date.now },
        editedDate: Date,
        editedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        tags: [String]
    });
    topicSchema.plugin(autoIncrement, modelName);
    return mongoose.model(modelName, topicSchema);
};