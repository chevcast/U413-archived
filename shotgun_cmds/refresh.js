exports.roles = 'user';

exports.description = "Refreshes the current topic, including comments.";

exports.invoke = function (shell) {
    var topicId = shell.getVar('lastTopic');
    if (typeof(topicId) === 'undefined')
        return shell.error("Nothing to refresh.");
    shell.execute('topic', null, { id: topicId });
};