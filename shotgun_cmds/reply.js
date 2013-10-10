exports.roles = 'user';

exports.description = "Allows you to reply to topics or private messages.";

exports.options = {
    content: {
        noName: true,
        required: true,
        prompt: "Please enter your reply.",
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
                body: quoteComment ? quoteComment.content + '\n\n' + options.content : options.content
            });
            newComment.save(function (err) {
                if (err) return shell.error(err);
                newComment.populate('creator editedBy topic', function (err, comment) {
                    if (err) return shell.error(err);
                    comment.topic.commentCount++;
                    comment.topic.lastCommentDate = comment.date;
                    comment.topic.save(function (err) {
                        if (err) return shell.error(err);
                        shell.newComment(comment.topic.id, {
                            comment: comment,
                            moment: require('moment')
                        });
                        //shell.log("Comment {{0}} saved successfully.".format(newComment.id));
                    });
                });
            });
        });
    }
    if (options.quote)
        shell.db.Comment.findById(options.quote, function (err, quoteComment) {
            if (err) return shell.error(err);
            if (!quoteComment) return shell.error("No comment with ID {{0}} exists.".format(options.quote));
            doReply(quoteComment);
        });
    else
        doReply();
};