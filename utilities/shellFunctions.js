/*

    The helpers module is designed to be passed into our shotgun shell instance.
    These helpers will be accessible within shotgun command modules.

 */

var jade = require('jade'),
    fs = require('fs'),
    path = require('path');

// Renders a Jade view from the views directory and returns it as a string.
exports.renderViewToString = function (name, locals) {
    var pathToTemplate = path.resolve('views', name + '.jade'),
        jadeFn = jade.compile(fs.readFileSync(pathToTemplate), { filename: pathToTemplate, pretty: false });
    return jadeFn(locals);
};

// Obtains a Jade view as a string and sends it to the client.
exports.view = function (name, locals) {
    var shell = this;
    return shell.log(shell.renderViewToString(name, locals), { dontType: true });
};

// Retrieves the currently authenticated user.
exports.getCurrentUser = function (callback) {
    var shell = this;
    shell.db.Session
        .findById(shell.getCookie('sessionId'))
        .populate('user')
        .exec(function (err, session) {
            if (err) return shell.error(err);
            callback(session.user);
        });
    return shell;
};

// Allows in-place modification of topics.
exports.modifyTopic = function (topicId, locals) {
    var shell = this,
        topicView = shell.renderViewToString('topic', locals);
    return shell.sendToAll({
        modifyTopic: {
            id: topicId,
            html: topicView
        }
    });
};

// Notifies all clients to remove the current topic and display a message.
exports.deleteTopic = function (topicId) {
    var shell = this;
    return shell.sendToOthers({ deleteTopic: topicId });
};

// Allows in-place addition of new comments.
exports.newComment = function (commentId, locals) {
    var shell = this,
        commentView = shell.renderViewToString('comment', locals);
    return shell.sendToAll({
        newComment: {
            id: commentId,
            html: commentView
        }
    });
};

// Allows in-place modification of comments.
exports.modifyComment = function (commentId, locals) {
    var shell = this,
        commentView = shell.renderViewToString('comment', locals);
    return shell.sendToAll({
        modifyComment: {
            id: commentId,
            html: commentView
        }
    });
};

// Removes a deleted comment from all clients' displays.
exports.deleteComment = function (commentId) {
    var shell = this;
    return shell.sendToAll({ deleteComment: commentId });
};

// Checks a command's custom roles property to see if the user can access the command.
exports.canAccessCmd = function (cmdName) {
    var shell = this,
        cmd = shell.cmds[cmdName];
    if (cmd.roles) {
        var cmdRoles = cmd.roles.replace(/, /g, ',').split(',');
        for (var cmdRoleIndex = 0; cmdRoleIndex < cmdRoles.length; cmdRoleIndex++) {
            var user = shell.getVar('currentUser'),
                cmdRole = cmdRoles[cmdRoleIndex];
            switch (cmdRole) {
                case 'all':
                    return true;
                case 'visitor':
                    if (!user) return true;
                    break;
                case 'user':
                    if (user) return true;
                    break;
                default:
                    if (user) {
                        for (var userRoleIndex = 0; userRoleIndex < user.roles.length; userRoleIndex++) {
                            var userRole = user.roles[userRoleIndex];
                            if (userRole === cmdRole) return true;
                        }
                    }
                    break;
            }
        }
    }
    else
        return true;
};