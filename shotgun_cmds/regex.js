var regex;

exports.roles = 'admin';

exports.description = "Provides basic regular expression tools.";

exports.usage = "[expression] [value]";

exports.options = {
    global: {
        aliases: ['g'],
        description: "Match against all matches in the string."
    },
    ignoreCase: {
        aliases: ['i'],
        description: "Run the expression without case-sensitivity."
    },
    expression: {
        noName: true,
        required: true,
        prompt: "Enter a JavaScript regular expression.",
        description: "The regular expression to use.",
        validate: function (value, options) {
            try {
                var modifiers = "";
                if (options.global) modifiers += "g";
                if (options.ignoreCase) modifiers += "i";
                regex = new RegExp(value, modifiers);
                return true;
            } catch (ex) {
                return ex.message;
            }
        }
    },
    value: {
        noName: true,
        required: true,
        prompt: "Enter a value to test with the regular expression.",
        description: "The value to test against the expression.",
        validate: function (value) {
            if (regex.test(value)) return true;
            else return '"{0}" did not match "{1}".'.format(regex, value);
        }
    }
};

exports.invoke = function (shell, options) {
    shell.log("Congratulations \"{0}\" matches \"{1}\"!".format(regex, options.value));
};