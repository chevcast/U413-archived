var moment = require('moment');

exports.roles = 'user';

exports.description = "Displays all topics or topics with specific tags.";

exports.usage = "[tags] [options]";

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
    },
    and: {
        aliases: 'a',
        description: "Topic must include all listed tags, rather than any of the listed tags."
    }
};

exports.invoke = function (shell, options) {
    shell.clearDisplay();
    var query = shell.db.Topic.find({});
    if (options.hasOwnProperty('tags')) {
        var tags = options.tags.toString().toLowerCase().replace(/, /, ',').split(',').unique();
        query = query.where('tags');
        if (options.and)
            query = query.all(tags);
        else
            query = query.in(tags);
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
                var currentUser = shell.getVar('currentUser'),
                    topicView;
                for (var index = 0; index < topic.views.length; index++) {
                    var view = topic.views[index];
                    if (view.userId == currentUser._id) {
                        topicView = view;
                        break;
                    }
                }
                var newCommentCount = topicView ? topic.commentCount - topicView.commentCount : topic.commentCount;
                shell.log('{{0}} {1}'.format(topic.id, topic.title), {
                    bold: true,
                    dontType: true,
                    cssClass: newCommentCount === 0 && topicView ? 'dim' : ''
                });
                shell.log(
                    '{0} by {1}'.format(moment(topic.date).fromNow(), topic.creator.username),
                    { cssClass: 'sub', dontType: true }
                );
                shell.log(topic.tags.join(','), { cssClass: 'sub', dontType: true });
                if (topic.commentCount > 0) {
                    shell.log(
                        '{0} {1} ({2} new)'.format(
                            topic.commentCount,
                            topic.commentCount === 1 ? 'Comment' : 'Comments',
                            newCommentCount
                        ),
                        { cssClass: 'sub', dontType: true }
                    );
                }
                shell.log();
            });
        }
    });
};