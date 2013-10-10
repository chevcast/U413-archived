var sio = require('socket.io'),
    fs = require('fs'),
    path = require('path'),
    extend = require('extend'),
    shellHelpers = require('./utilities/shellHelpers'),
    shellSettings = require('./utilities/shellSettings');

exports.attach = function (server) {

    // Store all the request listeners already defined on this server.
    var oldListeners = server.listeners('request').splice(0);

    // Remove all the request listeners already defined on this server.
    server.removeAllListeners('request');

    // Add our own request listener.
    server.on('request', function (req, res) {

        // If the request URL does not match the one we want to handle then invoke the pre-existing request listeners.
        if (req.url !== '/shotgun/shotgun.client.js') {
            for (var i = 0, l = oldListeners.length; i < l; i++) {
                oldListeners[i].call(server, req, res);
            }
        }
        // If the URL does match then serve up the following scripts:
        // - socket.io.js
        // - shotgun.client.js
        // - jquery.cooltype.js
        // - jquery.shotgunConsole.js
        else {
            try {
                fs.readFile(path.join(__dirname, '/node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.js'), function (err, socketIoClient) {
                    fs.readFile(path.join(__dirname, '/client/shotgun.client.js'), function (err, shotgunClient) {
                        fs.readFile(path.join(__dirname, '/client/jquery.cooltype.js'), function (err, jqueryCoolType) {
                            fs.readFile(path.join(__dirname, '/client/jquery.shotgunConsole.js'), function (err, jqueryShotgunConsole) {
                                res.writeHead(200, { 'Content-Type': 'application/javascript' });
                                res.end(socketIoClient + '\n\n' + shotgunClient + '\n\n' + jqueryCoolType + '\n\n' + jqueryShotgunConsole);
                            });
                        });
                    });
                });
            }
            catch (e) {
            }
        }

    });

    // Instantiate socket.io server.
    var io = sio.listen(server, { log: false });

    // Create an array of all arguments passed in except the first one.
    // The first argument was the http server and all other arguments are expected to be shotgun hell instances.
    var shells = [].splice.call(arguments,1);

    // Iterate over each shell and associate a socket.io namespace with each shell instance passed in.
    shells.forEach(function (shell) {

        // Add io to the shell for advanced users.
        shell.io = io;

        // Attach shotgun-client shell helpers to the shell instance so they are available to our command modules.
        extend(shell, shellHelpers);

        // Attach shotgun-client shell settings to the shell.
        extend(shell.settings, shellSettings);

        // Setup socket.io namespace for the current shell.
        io.of('/' + shell.settings.namespace)
            .on('connection', function (socket) {

                // Listen for our custom "execute" socket.io event.
                socket.on('execute', function (cmdStr, context, options) {

                    // Add current socket to context for advanced users.
                    context.socket = socket;

                    // If the shell has its debug setting enabled then write out user input to console.
                    if (shell.settings.debug) console.log('%s: %s', shell.settings.namespace, cmdStr);

                    // Configure the shell for this execution.
                    shell
                        // If shotgun modifies the context then send it to the client via this client's
                        // socket connection so it can be stored in the browser.
                        .onContextSave(function (contextToSave) {
                            var updatedContext = extend({}, contextToSave);
                            // Remove server-side socket from context before sending to client.
                            if (updatedContext.hasOwnProperty('socket')) delete updatedContext.socket;
                            socket.emit('saveContext', updatedContext);
                        })
                        // If shotgun sends any data then send it to the client to be handled.
                        .onData(function (data) {
                            socket.emit('data', data);
                        })
                        // Execute the shell.
                        .execute(cmdStr, context, options);
                });

            });
    });

    // Return any relevant internals for shotgun-client.
    return {
        io: io
    };
};