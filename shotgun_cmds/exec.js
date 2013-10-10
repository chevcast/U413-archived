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
    }
};

exports.invoke = function (shell, options) {
    vm.runInThisContext(options.code);
};