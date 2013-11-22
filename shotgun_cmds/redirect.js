exports.roles = 'user';

exports.description = "Redirects you to the specified URL.";

exports.options = {
    url: {
        required: true,
        noName: true,
        prompt: true
    }
};

exports.invoke = function (shell, options) {
    if (options.hasOwnProperty("url")) {
        if (!/^http:\/\//i.test(options.url))
            options.url = 'http://' + options.url;
        shell.redirect(options.url);
    }
    else
        shell.error("You must include a URL to redirect to.")
};

