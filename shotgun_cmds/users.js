exports.roles = 'user';

exports.description = "Displays a list of online users and stats about the number of registered users.";

exports.invoke = function(shell) {
    var connectedIds = []
    for (var key in shell.io.connected) {
        if (!shell.io.connected.hasOwnProperty(key)) return;
        if (shell.io.connected[key]) connectedIds.push(key);
    }
    shell.db.User.where('lastSocketId').in(connectedIds).exec(function (err, users) {
        if (err) return shell.error(err);
        if (!users)
            return shell.warn('No users online.');

        var fifteenMinutesAgo = Date.now() - (15 * 60000);

        shell.log();
        shell.log("ACTIVE", { inverted: true });
        users.forEach(function (user) {
            if (user.lastActiveDate >= fifteenMinutesAgo)
                shell.log(user.username);
        });
        shell.log();
        shell.log("IDLE", { inverted: true });
        users.forEach(function (user) {
            if (user.lastActiveDate < fifteenMinutesAgo)
                shell.log(user.username);
        });
    });
};