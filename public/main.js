function elementInViewport(el) {
    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document. documentElement.clientHeight) && /*or $(window).height() */
            rect.right <= (window.innerWidth || document. documentElement.clientWidth) /*or $(window).width() */
        );
}

function parseContent() {

    // Google Code Prettify
    var $code = $('code');
    $code.each(function () {
        var $this = $(this);
        if (!$this.hasClass('prettyprint')) $this.addClass('prettyprint');
    });
    prettyPrint();

    // Make links open in new tab.
    $('a').attr('target', '_blank');
}

$(function () {

    $.easing.elasout = function(x, t, b, c, d) {
        var s=1.70158;var p=0;var a=c;
        if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
        if (a < Math.abs(c)) { a=c; var s=p/4; }
        else var s = p/(2*Math.PI) * Math.asin (c/a);
        return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
    };

    var context = {};

    var api = $('#frame')
        .shotgunConsole({
            // The element that will scroll is the body, even though we're creating the console on a different element.
            $scrollElement: window
        })
        .onContextSave(function (updatedContext) {
            context = updatedContext;
            // Every time context changes check to see if there is a logged in user and update the page title.
            document.title = "> ";
            document.title += context.currentUser ? context.currentUser.username : "Terminal";
        })
        .onData(function (data) {

            var currentUser = api.clientShell.getVar('currentUser');

            if (data.refresh && api.ui.$cli.val().length === 0)
                location.reload();

            if (data.hideCli)
                api.ui.$cliContainer.hide();
            else if (data.showCli)
                api.ui.$cliContainer.show(function () {
                    api.ui.$cli.focus();
                });

            if (currentUser) {
                // Update comments/topics that are visible on the page if they change while being viewed.
                if (data.modifiedTopic) {
                    $('#topic-' + data.modifiedTopic.id).replaceWith(data.modifiedTopic.html);
                    parseContent();
                }

                if (data.deletedTopic)
                    if ($('#topic-' + data.deletedTopic.id).length > 0)
                        api.clientShell.warn("The topic you are currently viewing has been deleted.");

                if (data.newComment) {
                    var $topic = $('#topic-' + data.newComment.topicId);
                    if ($topic.length > 0) {
                        var $newComment = $(data.newComment.html),
                            $lastComment = $('[id^=comment-]').last(),
                            $comments = $('#comments');
                        $('#commentCount').text(data.newComment.commentCount);
                        $newComment.hide().appendTo($comments).slideDown('fast', function () {
                            parseContent();
                            // IF:
                            // - the entire comments container is visible in the viewport (meaning little or no comments)
                            // OR
                            // - there are comments and the last comment is visible in the viewport
                            // THEN
                            // scroll to our newly added comment.
                            if (elementInViewport($comments[0]) ||
                                ($lastComment.length > 0 && elementInViewport($lastComment[0]))) {
                                api.ui.$scrollElement.scrollTo($newComment, 750, { easing: 'elasout', axis: 'y' });
                                // User saw a new comment appear in the topic so ask the server to update their
                                // view information, marking the topic as read in the topics view. Otherwise they
                                // might think some topics have new comments even though they've already seen them
                                // when they auto-updated.
                                api.clientShell.socket.emit('updateTopicView', data.newComment.topicId, currentUser._id);
                            }
                        });
                    }
                }

                if (data.modifiedComment) {
                    $('#comment-' + data.modifiedComment.id).replaceWith(data.modifiedComment.html);
                    parseContent();
                }

                if (data.deletedComment) {
                    $('#commentCount').text(data.deletedComment.commentCount);
                    $('#comment-' + data.deletedComment.id).slideUp('fast', parseContent);
                }

                if (data.redirect) {
                    window.location.href = data.redirect;
                }
            }

            if (data.line)
                parseContent();
        })
        .execute('initialize');
});