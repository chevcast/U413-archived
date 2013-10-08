var async = require('async');

exports.roles = 'visitor';

exports.description = "Allows you to register for a new account.";

exports.usage = "[username] [email]";

exports.options = {
    username: {
        hidden: true,
        prompt: "Enter your desired username.",
        required: true,
        validate: function (username) {
            var usernameRegex = /^[a-z0-9_-]+$/i; // Only alphanumeric and underscores.
            return usernameRegex.test(username) ? true : "Username can only contain alphanumeric characters. (Regex: {0})".format(usernameRegex);
        }
    },
    email: {
        hidden: true,
        prompt: "Please enter your email. (We will NOT share your email with ANYONE!)",
        required: true,
        validate: function (email) {
            var emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
            /*
                Yes, I know this is the standard email regex everyone loves to complain about. This expression is
                practical and matches 99% of all email addresses. Users will have to validate their email address
                anyway so this expression is good enough.

                If you want to learn more visit: http://www.regular-expressions.info/email.html
            */
            return emailRegex.test(email) ? true : "Email format invalid. (Regex: {0})".format(emailRegex);
        }
    },
    "confirm email": {
        hidden: true,
        prompt: "Please confirm your email.",
        required: true,
        validate: function (email, shell, options) {
            if (email.toLowerCase() === options.email.toLowerCase())
                return true;
            else
                return "Emails did not match.";
        }
    },
    password: {
        hidden: true,
        prompt: "Please enter your desired password.",
        password: true,
        required: true,
        validate: function (password, shell, options) {
            if (password.length < 6)
                return "Password must be at least 6 characters long.";
            if (password.length > 75)
                return "Password must be less than 75 characters long.";
            if (options.username.indexOf(password) != -1 || password.indexOf(options.username) != -1)
                return "Password cannot contain your username or part of your username.";
            if (!password.match(/[a-z]/) || !password.match(/[A-Z]/))
                return "Password must contain at least one uppercase and lowercase character.";
            if (!password.match(/\d/))
                return "Password must contain a number.";
            return true;
        }
    },
    "confirm password": {
        hidden: true,
        prompt: "Please confirm your password.",
        required: true,
        password: true,
        validate: function (password, shell, options) {
            if(password === options.password)
                return true;
            else
                return "Passwords did not match.";
        }
    }
};

exports.invoke = function(shell, options) {
    // Make this command as fast as possible by running both database calls in parallel.
    async.parallel({
        usernameExists: function (callback) {
            shell.db.User.findOne({ username: new RegExp("^" + options.username + "$", "i") }, function (err, user) {
                if (err) return callback(err);
                callback(null, user ? true : false);
            })
        },
        emailExists: function (callback) {
            shell.db.User.findOne({ email: new RegExp("^" + options.email + "$", "i") }, function (err, user) {
                if (err) return callback(err);
                callback(null, user ? true : false);
            })
        }
    }, function (err, results) {
        // Both database calls have finished.
        if (err) return shell.error(err);

        // If username already exists then prompt the user to enter a new one.
        if (results.usernameExists) {
            shell.error("That username is already being used.");
            shell.log("Enter another username.");
            delete options.username;
            shell.setPrompt('username', 'register', options);
        }
        // If email already exists then prompt the user to enter a different one.
        else if (results.emailExists) {
            shell.error("That email address is already being used.");
            shell.log("Enter a different email address.");
            delete options.email;
            delete options["confirm email"];
            shell.setPrompt('email', 'register', options);
        }
        // If the username and email are not already taken then create the new user.
        else {
            var newUser = new shell.db.User({
                username: options.username,
                email: options.email,
                password: options.password
            });
            newUser.save(function (err) {
                if (err) shell.error(err);
                if (shell.settings.debug) {
                    console.log('New user registered:');
                    console.log(newUser);
                }
                shell.log("You have been registered successfully.");
                shell.execute('login', null, { username: options.username, password: options.password });
            });
        }
    });
};