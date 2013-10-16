var repl = require('repl'),
    stream = require('stream');

// Store repl instances in process as it is ok if they get blown away now and then.
process.repls = {};

exports.roles = 'admin';

exports.description = "Starts a node.js REPL.";

exports.usage = "[options]";

exports.options = {
    data: {
        hidden: true
    }
};

exports.invoke = function (shell, options) {
    var currentUser = shell.getVar('currentUser'),
        hasRepl = process.repls.hasOwnProperty(currentUser.id);

    // If the user does not have a repl instance stored in process or they are starting the repl with --clean then
    // create a new repl instance.
    if (!hasRepl || !options.hasOwnProperty('data')) {
        // Create pass-through streams in order to manually communicate with the repl instance.
        var inputStream = new stream.PassThrough(),
            outputStream = new stream.PassThrough();

        // When the output stream receives data, pump that data through the shotgun shell instance.
        outputStream.on('data', function (data) {
            if (data !== null) {
                shell.debug(data.toString(), { dontType: true });
            }
        });


        // White-list of global variables the repl will have access to.
        var allowedGlobals = ['_', 'ArrayBuffer', 'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array',
            'Int32Array', 'Uint32Array', 'Float32Array', 'Float64Array', 'DataView', 'Buffer', 'console', 'setTimeout',
            'clearTimeout', 'setInterval', 'clearInterval'];

        // White-list of repl command that are available.
        var allowedReplCmds = ['.break', '.clear', '.help'];

        // Remove access to built-in core node modules.
        repl._builtinLibs = [];

        // Start the repl and get reference to the repl instance.
        var replInstance = repl.start({
            prompt: '',
            ignoreUndefined: true,
            input: inputStream,
            output: outputStream
        });

        // Iterate over the variables in the repl context and the repl commands, then remove any that are not
        // white-listed.
        for (var key in replInstance.commands)
            if (!allowedReplCmds.contains(key))
                delete replInstance.commands[key];
        for (var key in replInstance.context)
            if (!allowedGlobals.contains(key))
                delete replInstance.context[key];
        // Add the shell instance to the repl context.
        replInstance.context.shell = shell;

        shell.debug("Welcome to the U413 node repl. You can execute arbitrary JavaScript here in a clean environment.");
        shell.debug("Underscore (_) is a special variable that stores the output of the last statement.");
        shell.debug("To leave the repl simply type \"cancel\".");
        shell.log();

        var replIO = { input: inputStream, output: outputStream };
        process.repls[currentUser.id] = replIO;
    }
    else if (options.hasOwnProperty('data') && hasRepl) {
        shell.log("> {0}".format(options.data), { dontType: true });
        process.repls[currentUser.id].input.write(options.data + '\n');
        delete options.data;
    }

    shell.setPrompt('data', 'node', {}, "REPL");
};