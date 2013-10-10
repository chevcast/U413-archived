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
                    $newComment.hide().appendTo($comments).slideDown();

                    // IF:
                    // - there are comments and the last comment is visible in browser viewport
                    // OR
                    // - there are no comments and the comment container is visible in browser viewport
                    // THEN
                    // scroll to our newly added comment.
                    if (($lastComment.length > 0 && elementInViewport($lastComment[0]))
                        || ($lastComment.length === 0 && elementInViewport($comments[0]))) {
                        if (elementInViewport($comments[0])) console.log("Comments container is visible.");
                        api.ui.$scrollElement.scrollTo($newComment);
                    }
                }
            }

            if (data.modifyComment)
                $('#comment-' + data.modifyComment.id).replaceWith(data.modifyComment.html);

            if (typeof(data.deleteComment) !== 'undefined')
                $('#comment-' + data.deleteComment).slideUp();

//            // If we clear the display then remove the lastTopic context variable since that topic will obviously
//            // no longer be visible to the user.
//            if (data.clearDisplay)
//                api.clientShell.delVar('lastTopic');
        })
        .execute('initialize');
});