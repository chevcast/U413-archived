var repl = require('repl'),
    stream = require('stream');

var allowedGlobals = ['ArrayBuffer', 'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array',
    'Uint32Array', 'Float32Array', 'Float64Array', 'DataView', 'Buffer', 'setTimeout', 'setInterval',
    'clearTimeout', 'clearInterval', 'console', '_'];

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
    var replIndex = shell.getVar('replIndex');
    var hasIndex = typeof(replIndex) !== 'undefined';
    if (!hasIndex || options.clean) {
        var inputStream = new stream.PassThrough(),
            outputStream = new stream.PassThrough();

        outputStream.on('data', function (data) {
            if (data !== null) {
                shell.debug(data.toString(), { dontType: true });
            }
        });

        var newRepl = repl.start({ prompt: '', ignoreUndefined: true, input: inputStream, output: outputStream });
        // Iterate over the variables in the repl context and remove any that are not white-listed.
        for (var key in newRepl.context)
            if (!allowedGlobals.contains(key))
                delete newRepl.context[key];

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