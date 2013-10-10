var mongoose = require('mongoose'),
    fs = require('fs'),
    path = require('path');

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
            // Find and load all Mongoose models from the models directory.
            fs.readdirSync(path.join(__dirname, 'models')).forEach(function (file) {
                if (path.extname(file) === '.js') {
                    var modelName = path.basename(file.replace(path.extname(file), ''));
                    var schema = require(path.join(__dirname, 'models', file)).createSchema();
                    models[modelName] = conn.model(modelName, schema);
                }
            });
            callback(models);
        });
    }
};