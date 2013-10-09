/*

    This command module is only for testing.
    If you need to test some command module logic then feel free to use this command module for that purpose.

 */

exports.roles = 'admin';

// Don't show in help menu.
exports.hidden = true;

exports.invoke = function (shell, options) {
    shell.multiLine();
};