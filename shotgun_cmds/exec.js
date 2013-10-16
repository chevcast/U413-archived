var vm = require('vm');

exports.roles = 'admin';

exports.description = "Allows execution of arbitrary JavaScript code.";

exports.options = {
    code: {
        required: true,
        prompt: "Enter the code.",
        multiLinePrompt: true,
        noName: true,
        description: "The JavaScript code to be executed."
    },
    client: {
        aliases: 'c',
        description: "Run the script on the client instead of the server."
    },
    allClients: {
        aliases: 'a',
        description: "Run the script on all clients."
    }
};

exports.invoke = function (shell, options) {
    try {
        if (options.client)
            shell.exec(options.code);
        else if (options.allClients)
            shell.execAll(options.code);
        else
            vm.runInNewContext(options.code, {
                shell: shell,
                console: console,
                process: process,
                require: require
            });
    } catch(ex) {
        shell.error(ex);
    }
};