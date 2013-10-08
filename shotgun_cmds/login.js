exports.roles = 'visitor';

exports.description = "Allows you to login to your account.";

exports.usage = "[username] [password]";

exports.options = {
    username: {
        noName: true,
        required: true,
        prompt: "Please enter your username.",
        hidden: true
    },
    password: {
        noName: true,
        required: true,
        prompt: "Please enter your password.",
        hidden: true,
        password: true
    }
};

exports.invoke = function(shell, options) {
    shell.db.User.findOne({ username: new RegExp("^" + options.username + "$", "i") }, function (err, user) {
        if (err) return shell.error(err);
        var valid = false;
        if (user) valid = user.password === options.password;
        if (!valid)
            shell.error("Username or password incorrect.");
        else {
            var sessionId = shell.getCookie('sessionId');
            shell.db.Session.findByIdAndUpdate(sessionId, { $set: { user: user } }, function (err) {
                if (err) return shell.error(err);
                shell.setVar('currentUser', user.toObject());
                shell.log("You are now logged in as {0}.".format(user.username));
            });
        }
    });
};