var mongoose = require('mongoose'),
    fs = require('fs'),
    path = require('path'),
    autoIncrement = require('mongoose-auto-increment');

module.exports = exports = {
    initialize: function (callback) {
        var models = {};
        var conn = mongoose.createConnection(process.env.CONNECTION_STRING.toString(), {
            server: {
                socketOptions: { keepAlive: 1 }
            }
        });
        conn.on('error', console.error);
        conn.once('open', function () {
            // Initialize mongoose-auto-increment plugin.
            autoIncrement.initialize(conn);

            // Find and load all Mongoose models from the models directory.
            fs.readdirSync(path.join(__dirname, 'models')).forEach(function (file) {
                if (path.extname(file) === '.js') {
                    var modelName = path.basename(file.replace(path.extname(file), ''));
                    var schema = require(path.join(__dirname, 'models', file)).createSchema();
                    if (schema.paths.hasOwnProperty('_id') && schema.paths._id.instance === 'Number')
                        schema.plugin(autoIncrement.plugin, modelName);
                    models[modelName] = conn.model(modelName, schema);
                }
            });
            callback(models);
        });
    }
};