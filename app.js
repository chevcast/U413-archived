/*

    This is the main entry point for the U413 application.
    U413 uses the Express MVC framework even though we only ever render a single view.
    In the future if there is a need to add additional pages to U413 it will be extremely simple.

*/

// Dependencies
var simpledb = require('mongoose-simpledb'),
    fs = require('fs'),
    http = require('http'),
    jade = require('jade'),
    stylus = require('stylus'),
    nodeStatic = require('node-static'),
    path = require('path'),
    extend = require('extend'),
    shellFunctions = require('./utilities/shellFunctions');

// Register prototype helpers.
require('./utilities/prototypeHelpers')();

// Get connection string.
var connString = process.env.CONNECTION_STRING;
if (!connString) connString = 'mongodb://u413-dev:PIrates@ds027758.mongolab.com:27758/u413-dev';

// Initialize the database module.
simpledb.init(
    { connectionString: connString },
    function (err, db) {
        if (err) return console.error(err);
        // Initialize node-static, a static file serving module.
        var file = new nodeStatic.Server('./public'),
            port = process.env.PORT || 3000;
        // Create basic http server.
        var server = http.createServer(function (request, response) {
            // Add a helper function to the response for easy redirections.
            response.redirect = function (url) {
                response.writeHead(301, { 'location': url });
                response.end();
            };

            // If the request is for "www." then redirect to bare domain.
            if (request.url.match(/^www/)) {
                response.writeHead(301, { 'location': redirect });
            }

            // When the request is finished, serve files.
            request.addListener('end', function () {
                // If the request is for the root URL then compile the index Jade view and serve it...
                if (request.url === '/') {
                    var jadeFn = jade.compile(
                        fs.readFileSync(path.resolve('views', 'index.jade')),
                        { filename: path.resolve('views', 'index.jade') }
                    );
                    response.writeHead(200, { "Content-Type": "text/html" });
                    response.end(jadeFn());
                }
                else if (request.url === '/styles.css') {
                    var stylusFile = fs.readFileSync(path.resolve('public', 'styles.styl'));
                    stylus(stylusFile.toString()).render(function(err, css) {
                        if (err) return console.error(err);
                        response.writeHead(200, { "Content-Type": "text/css" });
                        response.end(css);
                    });
                }
                // ...otherwise let node-static match the request to static files in the "public" directory.
                else
                    file.serve(request, response);
            }).resume();
        }).listen(port, function () {
            console.log("Listening at http://localhost:%s", port);
        });

        // Configure shotgun and shotgun-client modules.
        var shotgun = require('shotgun'),
            shell = new shotgun.Shell({
                debug: process.env.DEBUG,
                // Rather than define access functions on each command module we will specify the default access for all
                // command modules on the shell and set them to the shell helper function we created for checking command access.
                defaultCmdAccess: function (shell, cmdName) {
                    return shell.canAccessCmd(cmdName);
                }
            }),
            shotgunClient = require('shotgun-client');

        // Attach custom functions to the shell so they can be used in our command modules for U413.
        extend(shell, shellFunctions);
        shell.db = db;

        // Attach shotgun-client to the http server so it can listen for connections.
        shotgunClient.attach(server, shell);

        shell.io.set('transports', ['xhr-polling']);
    }
);