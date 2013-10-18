/*

    The helpers module is designed to be passed into our shotgun shell instance.
    These helpers will be accessible within shotgun command modules.

 */

var jade = require('jade'),
    fs = require('fs'),
    path = require('path'),
    extend = require('extend'),
    moment = require('moment'),
    marked = require('marked');

// By default we will not allow any user-supplied HTML. Only markup generated from marked will be allowed.
marked.setOptions({ sanitize: true });

// Renders a Jade view from the views directory and returns it as a string.
exports.renderViewToString = function (name, locals) {
    extend(locals, { moment: moment, marked: marked });
    var pathToTemplate = path.resolve('views', name + '.jade'),
        jadeFn = jade.compile(fs.readFileSync(pathToTemplate), { filename: pathToTemplate, pretty: false });
    return jadeFn(locals);
};

// Obtains a Jade view as a string and sends it to the client.
exports.view = function (name, locals, options) {
    return this.log(
        this.renderViewToString(name, locals),
        extend({ dontType: true }, options)
    );
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
exports.renderModifiedTopic = function (data, jadeContext) {
    data.html = this.renderViewToString('topic', jadeContext);
    return this.sendToAll({ modifiedTopic: data });
};

// Notifies all clients to remove the current topic and display a message.
exports.notifyTopicDeleted = function (data) {
    return this.sendToOthers({ deletedTopic: data });
};

// Allows in-place addition of new comments.
exports.renderNewComment = function (data, jadeContext) {
    data.html = this.renderViewToString('comment', jadeContext);
    return this.sendToAll({ newComment: data });
};

// Allows in-place modification of comments.
exports.renderModifiedComment = function (data, jadeContext) {
    data.html = this.renderViewToString('comment', jadeContext);
    return this.sendToAll({ modifiedComment: data });
};

// Removes a deleted comment from all clients' displays.
exports.removeDeletedComment = function (data) {
    return this.sendToAll({ deletedComment: data });
};

// Updates user's lastActiveDate and lastSocketId.
exports.updateUserData = function () {
    var shell = this;
    return shell.getCurrentUser(function (currentUser) {
        if (!currentUser) return;
        currentUser.lastActiveDate = Date.now();
        currentUser.lastSocketId = shell.getVar('socket').id;
        currentUser.save();
    });
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

exports.hideCli = function () {
    this.send({ hideCli: true });
};

exports.showCli = function () {
    this.send({ showCli: true });
};