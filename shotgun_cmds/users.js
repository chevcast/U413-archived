exports.roles = 'user';

exports.description = "Displays a list of online users and stats about the number of registered users.";

exports.invoke = function(shell) {
    var connectedIds = [];
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
                if (user.roles.contains('admin'))
                    shell.debug("{0} (admin)".format(user.username));
                else if (user.roles.contains('mod'))
                    shell.debug("{0} (mod)".format(user.username));
                else
                    shell.log(user.username);
        });
        shell.log();
        shell.log("IDLE", { inverted: true });
        users.forEach(function (user) {
            if (user.lastActiveDate < fifteenMinutesAgo)
                if (user.roles.contains('admin'))
                    shell.debug("{0} (admin)".format(user.username));
                else if (user.roles.contains('mod'))
                    shell.debug("{0} (mod)".format(user.username));
                else
                    shell.log(user.username);
        });
        shell.log();
        var visitors = connectedIds.length - users.length;
        shell.log("{0} {1}".format(visitors, visitors === 1 ? "VISITOR" : "VISITORS"), { inverted: true });
    });
};