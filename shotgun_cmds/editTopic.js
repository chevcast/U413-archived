exports.roles = 'user';

exports.description = "Edits the specified topic's content.";

exports.usage = "<ID> [title] [content] [tags]";

exports.options = {
    id: {
        required: true,
        prompt: "Please enter a topic ID to edit.",
        noName: true,
        hidden: true,
        validate: /^\d+$/,
        default: function (shell) {
            return shell.getVar('lastTopic');
        }
    },
    title: {
        noName: true,
        hidden: true,
        validate: /^.{1,10000}$/i
    },
    content: {
        noName: true,
        hidden: true,
        validate: /^.{1,10000}$/i
    },
    tags: {
        noName: true,
        hidden: true,
        validate: function (tags) {
            var regex = /^[\w-]{2,30}(, ?[\w-]{2,30}){0,4}$/i;
            return regex.test(tags) ? true : "Tags must be a comma-delimited list with no more than five items. (Regex: {0})".format(regex);
        }
    },
    dontShow: {
        aliases: ['d'],
        description: "Don't display the topic after modifying it."
    }
};

exports.invoke = function (shell, options) {
    shell.db.Topic.findById(options.id)
        .populate('creator editedBy')
        .exec(function (err, topic) {
            if (err) return shell.error(err);
            if (!topic) return shell.error("No topic with ID {{0}} exists.".format(options.id));
            shell.getCurrentUser(function (currentUser) {
                if (topic.creator.id != currentUser.id && !currentUser.isModOrAdmin())
                    return shell.error("Topic {{0}} does not belong to you.".format(options.id));
                if (!options.title) {
                    shell.multiLine().edit(topic.title);
                    shell.log("Modify topic {{0}} title.".format(options.id));
                    shell.setPrompt('title', 'editTopic', options);
                }
                else if (!options.content) {
                    shell.edit(topic.body);
                    shell.log("Modify topic {{0}} content.".format(options.id));
                    shell.setPrompt('content', 'editTopic', options);
                }
                else if (!options.tags) {
                    shell.edit(topic.tags.join(', '));
                    shell.log("Modify topic {{0}} tags.".format(options.id));
                    shell.setPrompt('tags', 'editTopic', options);
                }
                else {
                    topic.editedDate = Date.now();
                    topic.editedBy = currentUser;
                    topic.title = options.title;
                    topic.body = options.content;
                    topic.tags = options.tags.replace(/, /g, ',').split(',');
                    topic.save(function (err, topic) {
                        if (err) return shell.error(err);
                        topic.populate('creator editedBy', function (err, topic) {
                            if (err) return shell.error(err);
                            shell.db.Comment.find({ topic: topic.id }, function (err, comments) {
                                if (err) return shell.error(err);
                                if (!options.dontShow)
                                    shell.modifyTopic(options.id, {
                                        topic: topic,
                                        comments: comments,
                                        moment: require('moment')
                                    });
                                shell.log("Topic {{0}} updated successfully.".format(options.id));
                            });
                        });
                    });
                }
            });
        });
};