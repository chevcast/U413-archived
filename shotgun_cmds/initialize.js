/*

    This command runs automatically when the page loads.
    Any U413 initialization logic belongs in this module.

 */

// Don't show this command in the help menu.
exports.hidden = true;

exports.invoke = function (shell) {
    var lineOptions = {
        coolTypeOptions: {
            typeSpeed: 30,
            delayBeforeType: 0,
            delayAfterType: 2000
        }
    };

    // I want all lines in this module to have a specific set of options so I'm creating my own helper.
    // This way I only pass in lineOptions one time instead of for each line.
    shell.type = function (text) {
        shell.log(text, lineOptions);
    };

    var visited = shell.getCookie('visited'),
        sessionId = shell.getCookie('sessionId');

    // Display welcome messages.
    if (!visited) {
        shell.type('Welcome!');
        shell.type('My name is Unh4nd13d.');
        shell.type("I released the first version of U413 back in 2010.");
        shell.type("I'd like to thank JamezQ, PiMaster, and Lamberti for holding down the fort and keeping U413 alive the entire time I was gone.");
        shell.type("If you bump into any of them in the forums be sure to thank them for their hard work.");
        shell.log();
        shell.type("This version of U413 is designed to be easy for open-source developers to contribute to.");
        shell.type("If you would like to learn more about the project please type \"about\".")

        // Set a cookie to track that the user has visited.
        shell.setCookie("visited", "true", 365);
    }

    shell.getVar('socket')
        // Update user data every time they send data.
        .on('execute', function () {
            shell.updateUserData();
        })
        // Allow client to update their view data on a topic.
        .on('updateTopicView', function (topicId, userId) {
            shell.db.Topic.findById(topicId, function (err, topic) {
                if (err) return shell.error(err);
                shell.db.Comment.where('topic').equals(topicId).exec(function (err, comments) {
                    if (err) return shell.error(err);
                    var hasViewed = false;
                    for (var index = 0; index < topic.views.length; index++) {
                        var view = topic.views[index];
                        if (view.userId == userId) {
                            hasViewed = true;
                            view.commentCount = comments.length;
                            break;
                        }
                    }
                    if (!hasViewed)
                        topic.views.push({
                            userId: userId,
                            commentCount: comments.length
                        });
                    topic.save();
                });
            });
        });

    // Creates a new session document, saves it to the database,
    // then sets a cookie with the session document ID as the value.
    function createSession() {
        var session = new shell.db.Session();
        session.save(function (err) {
            if (err) return shell.error(err);
            shell.setCookie("sessionId", session.id, 30);
        });
    }

    if (sessionId)
        shell.db.Session
            .findById(sessionId)
            .populate('user')
            .exec(function (err, session) {
                if (err) return shell.error(err);
                if (session) {
                    if (session.user) {
                        shell.setVar('currentUser', session.user.toObject());
                        shell.updateUserData();
                        shell.log("You are logged in as {0}.".format(session.user.username));
                    }
                }
                else
                    createSession();
            });
    else
        createSession();

    // Display this every time, whether they've visted before or not.
    shell.log("Type \"help\" to see what commands are available.");
};