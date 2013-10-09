var mongoose = require('mongoose'),
    fs = require('fs'),
    path = require('path');

module.exports = exports = {
    initialize: function (shell) {
        shell.db = {};
        mongoose.connect(process.env.CONNECTION_STRING.toString());
        mongoose.connection.on('error', function (err) {
            console.error(err);
            shell.warn("Waking up database. Wait a moment and try again :)");
        });
        mongoose.connection.once('open', function callback() {
            // Find and load all Mongoose models from the models directory.
            fs.readdirSync(path.join(__dirname, 'models')).forEach(function (file) {
                if (path.extname(file) === '.js') {
                    var modelName = path.basename(file.replace(path.extname(file), ''));
                    var model = require(path.join(__dirname, 'models', file)).createModel(modelName);
                    shell.db[modelName] = model;
                }
            });
        });
    }
};