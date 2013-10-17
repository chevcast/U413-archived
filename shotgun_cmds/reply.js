exports.roles = 'user';

exports.description = "Allows you to reply to topics or private messages.";

exports.options = {
    content: {
        noName: true,
        required: true,
        prompt: "Please enter your reply. (you can use Github-flavored Markdown syntax)",
        multiLinePrompt: true,
        validate: /^.{1,5000}/i,
        hidden: true
    },
    topicId: {
        validate: /^\d+$/,
        required: true,
        prompt: "Please enter the ID of the topic to reply to.",
        description: "The ID of the topic to reply to.",
        default: function (shell) {
            return shell.getVar('lastTopic');
        }
    },
    quote: {
        aliases: ['q'],
        prompt: "Enter the ID of the comment you wish to quote.",
        description: "Allows you to quickly quote another comment.",
        validate: /^\d+$/
    }
};

exports.invoke = function(shell, options) {
    function doReply(quoteComment) {
        shell.getCurrentUser(function (user) {
            var newComment = new shell.db.Comment({
                creator: user,
                topic: options.topicId,
                body: quoteComment ? "> {{0}} {1}>\n>\n> {2}\n\n{3}".format(
                        quoteComment.id,
                        quoteComment.creator.username,
                        quoteComment.body.replace(/\n/g, '\n> '),
                        options.content
                    ) : options.content
            });
            newComment.save(function (err) {
                if (err) return shell.error(err);
                newComment.populate('creator editedBy topic', function (err, comment) {
                    if (err) return shell.error(err);
                    comment.topic.commentCount++;
                    comment.topic.lastCommentDate = comment.date;
                    comment.topic.save(function (err) {
                        if (err) return shell.error(err);
                        shell.renderNewComment(
                            {
                                topicId: comment.topic.id,
                                commentCount: comment.topic.commentCount
                            },
                            {
                                comment: comment,
                                moment: require('moment')
                            }
                        );
                    });
                });
            });
        });
    }
    if (options.hasOwnProperty('quote'))
        shell.db.Comment
            .findById(options.quote)
            .populate('creator')
            .exec(function (err, quoteComment) {
                if (err) return shell.error(err);
                if (!quoteComment) return shell.error("No comment with ID {{0}} exists.".format(options.quote));
                doReply(quoteComment);
            });
    else
        doReply();
};