exports.roles = 'user';

exports.description = "Allows you to sign out of your account.";

exports.invoke = function(shell) {
    var sessionId = shell.getCookie('sessionId');
    shell.db.Session.findByIdAndUpdate(sessionId, { $unset: { user: 1 } }, function (err) {
        if (err) return shell.error(err);
        shell.log("You were successfully logged out.");
        shell.delVar('currentUser');
        shell.delVar('replIndex');
    });
};