exports.roles = 'user';

exports.description = "Deletes the specified comment.";

exports.usage = "<ID>";

exports.options = {
    id: {
        required: true,
        prompt: "Please enter a comment ID to delete.",
        noName: true,
        hidden: true,
        validate: /^\d+$/
    },
    confirm: {
        description: "Confirms comment deletion.",
        validate: function (confirm, shell, options) {
            var confirmRegex = /^y(es)?|true$/i;
            options.confirm = confirmRegex.test(confirm);
            return options.confirm ? true : "Comment deletion canceled.";
        }
    }
};

exports.invoke = function (shell, options) {
    shell.getCurrentUser(function (user) {
        shell.db.Comment
            .findById(options.id)
            .populate('topic')
            .exec(function (err, comment) {
                if (err) return shell.error(err);
                if (!comment) return shell.error("No comment with ID {{0}} exists.".format(options.id));
                if (user.id != comment.creator && !user.isModOrAdmin())
                    return shell.error("Comment {{0}} does not belong to you.".format(options.id));
                if (!options.confirm) {
                    shell.warn("Are you sure you want to delete comment {{0}}? (Y/N)".format(options.id));
                    return shell.setPrompt('confirm', 'delComment', options, 'Are you sure?');
                }
                comment.remove(function (err) {
                    if (err) return shell.error(err);
                    shell.db.Comment
                        .findOne({ topic: comment.topic.id })
                        .sort('-date')
                        .exec(function (err, prevComment) {
                            if (err) return shell.error(err);
                            comment.topic.commentCount--;
                            comment.topic.lastCommentDate = prevComment ? prevComment.date : comment.topic.date;
                            comment.topic.views.forEach(function (view) {
                                view.commentCount--;
                            });
                            comment.topic.save(function (err) {
                                if (err) return shell.error(err);
                                shell.removeDeletedComment({ id: options.id, commentCount: comment.topic.commentCount });
                                shell.log("Comment {{0}} was successfully deleted.".format(options.id));
                            });
                        });
                });
            });
    });
};
