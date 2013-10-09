var moment = require('moment');

exports.roles = 'user';

exports.description = "Displays all topics or topics with specific tags.";

exports.usage = "[tags]";

exports.options = {
    tags: {
        noName: true,
        description: "A comma-delimited list of tags.",
        validate: function (tags) {
            var regex = /^[\w-]{2,30}(, ?[\w-]{2,30}){0,9}$/i;
            if (regex.test(tags))
                return true;
            else
                return "Tags must be a comma-delimited list with no more than ten items. (Regex: {0})".format(regex);
        }
    }
};

exports.invoke = function (shell, options) {
    shell.clearDisplay();
    var query = shell.db.Topic.find({});
    if (options.hasOwnProperty('tags')) {
        var tags = options.tags.toString().toLowerCase().replace(/, /, ',').split(',').unique();
        query = query.where('tags').in(tags);
        shell.log('Topics tagged: {0}'.format(tags.join(',')), { bold: true });
        shell.log();
    }
    query
        .populate('creator editedBy')
        .sort('lastCommentDate')
        .exec(function (err, topics) {
        if (err) return shell.error(err);
        if (topics.length === 0)
            shell.warn('No results.');
        else {
            topics.forEach(function (topic) {
                shell.log('{{0}} {1}'.format(topic.id, topic.title), { bold: true, dontType: true });
                shell.log(
                    '{0} by {1}'.format(moment(topic.date).fromNow(), topic.creator.username),
                    { cssClass: 'sub', dontType: true }
                );
                shell.log(topic.tags.join(','), { cssClass: 'sub', dontType: true });
                if (topic.commentCount > 0)
                    shell.log(
                        '{0} {1}'.format(topic.commentCount, topic.commentCount === 1 ? 'Comment' : 'Comments'),
                        { cssClass: 'sub', dontType: true }
                    );
                shell.log();
            });
        }
    });
};