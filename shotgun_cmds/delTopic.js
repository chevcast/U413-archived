exports.roles = 'mod, admin';

exports.description = "Deletes the specified topic.";

exports.usage = "<ID>";

exports.options = {
    id: {
        required: true,
        default: function (shell) {
            return shell.getVar('lastTopic');
        },
        prompt: "Please enter a topic ID to delete.",
        noName: true,
        hidden: true,
        validate: /^\d+$/
    },
    confirm: {
        description: "Confirms topic deletion.",
        validate: function (confirm, shell, options) {
            var confirmRegex = /^y(es)?|true$/i;
            options.confirm = confirmRegex.test(confirm);
            return options.confirm ? true : "Topic deletion canceled.";
        }
    }
};

exports.invoke = function (shell, options) {
    if (!options.confirm) {
        shell.warn("Are you sure you want to delete topic {{0}}? (Y/N)".format(options.id));
        return shell.setPrompt('confirm', 'delTopic', options, 'Are you sure?');
    }
    shell.db.Topic.findByIdAndRemove(options.id, function (err) {
        if (err) return shell.error(err);
        shell.db.Comment.where('topic').equals(options.id).remove(function (err) {
            if (err) return shell.error(err);
            shell.deleteTopic(options.id);
            shell.log("Topic {{0}} was successfully deleted.".format(options.id));
        });
    });
};