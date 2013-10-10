exports.roles = 'user';

exports.description = "Edits the specified comment's content.";

exports.usage = "<ID> [content]";

exports.options = {
    id: {
        required: true,
        prompt: "Please enter a comment ID to edit.",
        noName: true,
        hidden: true,
        validate: /^\d+$/
    },
    content: {
        noName: true,
        hidden: true,
        validate: /^.{1,5000}/i
    }
};

exports.invoke = function (shell, options) {
    shell.db.Comment.findById(options.id, function (err, comment) {
        if (err) return shell.error(err);
        if (!comment) return shell.error("No comment with ID {{0}} exists.".format(options.id));
        shell.getCurrentUser(function (currentUser) {
            if (comment.creator != currentUser.id && !currentUser.isModOrAdmin())
                return shell.error("Comment {{0}} does not belong to you.".format(options.id));
            // If user did not supply content already then set the CLI text to edit and prompt for comment content.
            if (!options.content) {
                shell.multiLine().edit(comment.body);
                shell.log("Modify comment {{0}} content.".format(options.id));
                shell.setPrompt('content', 'editComment', options);
            }
            else {
                // If we have comment content then modify the comment.
                comment.body = options.content;
                comment.editedDate = Date.now();
                comment.editedBy = currentUser;
                comment.save(function (err, comment) {
                    if (err) return shell.error(err);
                    comment.populate('creator editedBy', function (err, comment) {
                        if (err) return shell.error(err);
                        shell.modifyComment(options.id, {
                            comment: comment,
                            moment: require('moment')
                        });
                        shell.log("Comment {{0}} updated successfully.".format(options.id));
                    });
                });
            }
        });
    });
};