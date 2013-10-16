var repl = require('repl'),
    stream = require('stream');

// White-list of global variables the repl will have access to.
var allowedGlobals = ['ArrayBuffer', 'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array',
    'Uint32Array', 'Float32Array', 'Float64Array', 'DataView', 'Buffer', 'setTimeout', 'setInterval',
    'clearTimeout', 'clearInterval', 'console', '_'];

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
        currentUser = shell.getVar('currentUser'),
        isAdmin = currentUser.roles.contains('admin');

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

        // If the user is not an admin then remove access to built-in core node modules.
        if (!isAdmin)
            repl._builtinLibs = [];
        // Start the repl and get reference to the repl instance.
        var replInstance = repl.start({ prompt: '', ignoreUndefined: true, input: inputStream, output: outputStream });
        // If the user is not an admin then iterate over the variables in the repl context and remove any that are not
        // white-listed.
        if (!isAdmin)
            for (var key in replInstance.context)
                if (!allowedGlobals.contains(key))
                    delete replInstance.context[key];

        var replStreams = { input: inputStream, output: outputStream };
        if (!hasIndex) {
            process.repls.push(replStreams);
            shell.setVar('replIndex', process.repls.length - 1);
            shell.debug("Welcome to the U413 node repl. You can execute arbitrary JavaScript here in a clean environment. To leave the repl simply type \"cancel\".");
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