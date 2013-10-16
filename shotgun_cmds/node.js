var fs = require('fs'),
    path = require('path'),
    vm = require('vm'),
    repl = require('repl'),
    stream = require('stream');

// Store repl instances in process as it is ok if they get blown away now and then.
process.repls = [];

exports.roles = 'user';

exports.description = "Starts a node.js REPL.";

exports.usage = "[options]";

exports.options = {
    clean: {
        aliases: 'c',
        description: "Starts the repl in a clean environment. (won't remember variables from the last repl)"
    },
    data: {
        hidden: true
    }
};

exports.invoke = function (shell, options) {
    var replIndex = shell.getVar('replIndex'),
        hasIndex = typeof(replIndex) !== 'undefined',
        currentUser = shell.getVar('currentUser');

    // If the user does not have a repl instance stored in process or they are starting the repl with --clean then
    // create a new repl instance.
    if (!hasIndex || options.clean) {
        // Create pass-through streams in order to manually communicate with the repl instance.
        var inputStream = new stream.PassThrough(),
            outputStream = new stream.PassThrough();

        // When the output stream receives data, pump that data through the shotgun shell instance.
        outputStream.on('data', function (data) {
            if (data !== null) {
                shell.debug(data.toString(), { dontType: true });
            }
        });

        fs.readFile(path.join('utilities', 'replCode.js'), function (err, replCode) {
            if (err) return shell.error(err);
            try {
                vm.runInNewContext(replCode, {
                    isAdmin: currentUser.roles.contains('admin'),
                    repl: repl,
                    inputStream: inputStream,
                    outputStream: outputStream,
                    console: console
                });
            }
            catch (ex) {
                shell.error(ex);
            }
        });

        var replStreams = { input: inputStream, output: outputStream };
        if (!hasIndex) {
            process.repls.push(replStreams);
            shell.setVar('replIndex', process.repls.length - 1);
            shell.debug("Welcome to the U413 node repl. You can execute arbitrary JavaScript here in a clean environment.");
            shell.debug("Underscore (_) is a special variable that stores the output of the last statement.");
            shell.debug("To leave the repl simply type \"cancel\".");
            shell.log();
        }
        else
            process.repls[replIndex] = replStreams;
    }
    else if (options.hasOwnProperty('data')) {
        shell.log("> {0}".format(options.data), { dontType: true });
        process.repls[replIndex].input.write(options.data + '\n');
        delete options.data;
    }

    shell.setPrompt('data', 'node', {}, "REPL");
};