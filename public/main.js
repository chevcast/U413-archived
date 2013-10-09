function elementInViewport(elem) {
    if (!elem)
        return false;
    var top = elem.offsetTop;
    var left = elem.offsetLeft;
    var width = elem.offsetWidth;
    var height = elem.offsetHeight;

    while(elem.offsetParent) {
        elem = elem.offsetParent;
        top += elem.offsetTop;
        left += elem.offsetLeft;
    }

    return (top < (window.pageYOffset + window.innerHeight) &&
        left < (window.pageXOffset + window.innerWidth) &&
        (top + height) > window.pageYOffset &&
        (left + width) > window.pageXOffset);
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
                if ($('#topic-' + data.newComment.id).length > 0) {
                    var $newComment = $(data.newComment.html),
                        $lastComment = $('[id^=comment-]').last(),
                        $comments = $('#comments');
                    $newComment.hide().appendTo($comments).slideDown();
                    // Check if the last comment was visible in the viewport. If so, scroll to the new comment.
                    if (elementInViewport($lastComment[0]) || elementInViewport($comments[0])) {
                        console.log('scrolling');
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