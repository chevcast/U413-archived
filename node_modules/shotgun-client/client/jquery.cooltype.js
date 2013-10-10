(function ($) {

    var defaults = {
        typeSpeed: 10,
        cursorChar: '&#9608;',
        cursorBlinkSpeed: 300,
        delayBeforeType: 1000,
        delayAfterType: 3000,
        onComplete: false,
        onBeforeType: false,
        onAfterType: false,
        expansions: [
            '&nbsp;',
            '&gt;',
            '&lt;',
            '&quot;',
            '&amp;'
        ]
    };

    $.fn.coolType = function (text, options) {
        var $this = this,
            settings = $.extend({}, defaults, options),
            $container = $('<span>'),
            $cursor = $('<span>')
                .css({
                    paddingLeft: 3
                })
                .html('&nbsp;');

        $cursor.show = function () {
            $cursor.html(settings.cursorChar);
            $cursor.data('showing', true);
        };
        $cursor.hide = function () {
            $cursor.html('&nbsp;');
            $cursor.data('showing', false);
        };
        $cursor.toggle = function () {
            var showing = $cursor.data('showing');
            if (showing) $cursor.hide();
            else $cursor.show();
        };

        $container.appendTo($this);
        $cursor.appendTo($this);

        function startBlinking() {
            $cursor.data('intervalId', setInterval(function () {
                $cursor.toggle();
            }, settings.cursorBlinkSpeed));
        }

        function stopBlinking() {
            clearInterval($cursor.data('intervalId'));
        }

        function expandChar(charIndex) {
            var char = text[charIndex];
            for (var expansionIndex in settings.expansions) {
                var expansion = settings.expansions[expansionIndex];
                if (expansion[0] === char) {
                    var textToCompare = text.substr(charIndex, expansion.length);
                    if (textToCompare === expansion)
                        return { char: expansion, charIndex: charIndex + (expansion.length - 1) };
                }
            }
            return { char: char, charIndex: charIndex };
        }

        function typeText() {
            if (settings.onBeforeType) settings.onBeforeType();
            var charIndex = 0;
            var intervalId = setInterval(function () {
                var expanded = expandChar(charIndex),
                    char = expanded.char;
                charIndex = expanded.charIndex;
                $container.append(char);
                charIndex++;
                if (charIndex === text.length) {
                    clearInterval(intervalId);
                    if (settings.onAfterType) settings.onAfterType();
                    if (settings.delayAfterType > 0) {
                        startBlinking();
                        setTimeout(function () {
                            stopBlinking();
                            $cursor.remove();
                            if (settings.onComplete) settings.onComplete();
                        }, settings.delayAfterType);
                    }
                    else {
                        $cursor.remove();
                        if (settings.onComplete) settings.onComplete();
                    }
                }
            }, settings.typeSpeed);
        }

        if (settings.delayBeforeType > 0) {
            $cursor.show();
            startBlinking();
            setTimeout(function () {
                stopBlinking();
                $cursor.show();
                typeText();
            }, settings.delayBeforeType);
        }
        else {
            $cursor.show();
            typeText();
        }
    };
})(jQuery);