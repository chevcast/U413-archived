exports.roles = 'user';

exports.description = "Notifies moderators that the specified post violates the rules.";

exports.invoke = function(shell) {
    shell.warn("The report command is unfinished. When complete it will allow you to report topics and replies that violate the rules. Moderators will be notified of the infraction and will investigate.");
};