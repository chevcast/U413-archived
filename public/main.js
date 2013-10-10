function elementInViewport(el) {
    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document. documentElement.clientHeight) && /*or $(window).height() */
            rect.right <= (window.innerWidth || document. documentElement.clientWidth) /*or $(window).width() */
        );
}

$(function () {

    $.easing.elasout = function(x, t, b, c, d) {
        var s=1.70158;var p=0;var a=c;
        if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
        if (a < Math.abs(c)) { a=c; var s=p/4; }
        else var s = p/(2*Math.PI) * Math.asin (c/a);
        return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
    };

    var api = $('#frame')
        .shotgunConsole({
            // The element that will scroll is the body, even though we're creating the console on a different element.
            $scrollElement: 'body'
        })
        .onContextSave(function (context) {
            // Every time context changes check to see if there is a logged in user and update the page title.
            document.title = "> ";
            document.title += context.currentUser ? context.currentUser.username : "Terminal";
        })
        .onData(function (data) {
            // Update comments/topics that are visible on the page if they change while being viewed.
            if (data.modifyTopic)
                $('#topic-' + data.modifyTopic.id).replaceWith(data.modifyTopic.html);

            if (typeof(data.deleteTopic) !== 'undefined')
                if ($('#topic-' + data.deleteTopic).length > 0)
                    api.clientShell.warn("The topic you are currently viewing has been deleted.");

            if (data.newComment) {
                var $topic = $('#topic-' + data.newComment.topicId);
                if ($topic.length > 0) {
                    var $newComment = $(data.newComment.html),
                        $lastComment = $('[id^=comment-]').last(),
                        $comments = $('#comments');
                    $newComment.hide().appendTo($comments).slideDown('fast', function () {
                        // IF:
                        // - the entire comments container is visible in the viewport (meaning little or no comments)
                        // OR
                        // - there are comments and the last comment is visible in the viewport
                        // THEN
                        // scroll to our newly added comment.
                        if (elementInViewport($comments[0])
                            || ($lastComment.length > 0 && elementInViewport($lastComment[0]))) {
                            api.ui.$scrollElement.scrollTo($lastComment, 750, { easing: 'elasout' });
                        }
                    });
                }
            }

            if (data.modifyComment)
                $('#comment-' + data.modifyComment.id).replaceWith(data.modifyComment.html);

            if (typeof(data.deleteComment) !== 'undefined')
                $('#comment-' + data.deleteComment).slideUp('fast');
        })
        .execute('initialize');
});