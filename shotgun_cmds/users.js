exports.roles = 'user';

exports.description = "Displays a list of online users and stats about the number of registered users.";

exports.invoke = function(shell) {
    var connectedIds = [],
        isGui = shell.getVar('gui');
    for (var key in shell.io.connected) {
        if (!shell.io.connected.hasOwnProperty(key)) return;
        if (shell.io.connected[key]) connectedIds.push(key);
    }
    shell.db.User.count({}, function (err, numUsers) {
        shell.db.User.where('lastSocketId').in(connectedIds).exec(function (err, users) {
            if (err) return shell.error(err);
            if (!users)
                return shell.warn('No users online.');

            var visitors = connectedIds.length - users.length,
                fifteenMinutesAgo = Date.now() - (10 * 60000);

            if (!isGui) {
                shell.log();
                shell.log("ONLINE: {0}/{1} USER{2} | {3} VISITOR{4}".format(
                    users.length,
                    numUsers,
                    numUsers === 1 ? "" : "S",
                    visitors,
                    visitors === 1 ? "" : "S"
                ), { bold: true });
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
            }
            else {
                shell.clearDisplay();
                shell.view('gui/users', {
                    visitors: visitors,
                    numUsers: numUsers,
                    fifteenMinutesAgo: fifteenMinutesAgo,
                    users: users
                }, { dontScroll: true });
            }
        });
    });
};