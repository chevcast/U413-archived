exports.roles = 'user';

exports.description = "Allows you to reply to topics or private messages.";

exports.options = {
    content: {
        noName: true,
        required: true,
        prompt: "Please enter your reply.",
        validate: /^.{1,5000}$/i,
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
    dontShow: {
        aliases: ['d'],
        description: "Don't display the topic after saving the reply."
    }
};

exports.invoke = function(shell, options) {
    shell.getCurrentUser(function (user) {
        var newComment = new shell.db.Comment({
            creator: user,
            topic: options.topicId,
            body: options.content
        });
        newComment.save(function (err) {
            if (err) return shell.error(err);
            newComment.populate('creator editedBy', function (err, comment) {
                if (err) return shell.error(err);
                shell.newComment(newComment.id, {
                    comment: comment,
                    moment: require('moment')
                });
                shell.log("Comment {{0}} saved successfully.".format(newComment.id));
            });
        });
    });
};