(function ($) {

    // Other jQuery plugins we are using.
    (function () {
        $.fn.getCursorPosition = function () {
            var pos = 0;
            var input = this[0];
            // IE Support
            if (document.selection) {
                input.focus();
                var sel = document.selection.createRange();
                var selLen = document.selection.createRange().text.length;
                sel.moveStart('character', -input.value.length);
                pos = sel.text.length - selLen;
            }
            // Firefox support
            else if (input.selectionStart || input.selectionStart == '0')
                pos = input.selectionStart;

            return pos;
        };

        $.fn.setCursorPosition = function (pos) {
            return this.each(function () {
                if (this.setSelectionRange) {
                    this.focus();
                    this.setSelectionRange(pos, pos);
                } else if (this.createTextRange) {
                    var range = this.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', pos);
                    range.moveStart('character', pos);
                    range.select();
                }
            });
        };

        $.fn.elastic = function () {
            //      We will create a div clone of the textarea
            //      by copying these attributes from the textarea to the div.
            var mimics = [
                'paddingTop',
                'paddingRight',
                'paddingBottom',
                'paddingLeft',
                'fontSize',
                'lineHeight',
                'fontFamily',
                'width',
                'fontWeight',
                'border-top-width',
                'border-right-width',
                'border-bottom-width',
                'border-left-width',
                'borderTopStyle',
                'borderTopColor',
                'borderRightStyle',
                'borderRightColor',
                'borderBottomStyle',
                'borderBottomColor',
                'borderLeftStyle',
                'borderLeftColor'
            ];

            return this.each(function () {
                // Elastic only works on textareas
                if (this.type !== 'textarea') {
                    return false;
                }

                var $textarea = jQuery(this),
                    $twin = jQuery('<div />').css({
                        'position': 'absolute',
                        'display': 'none',
                        'word-wrap': 'break-word',
                        'white-space': 'pre-wrap'
                    }),
                    lineHeight = parseInt($textarea.css('line-height'), 10) || parseInt($textarea.css('font-size'), '10'),
                    minheight = parseInt($textarea.css('height'), 10) || lineHeight * 3,
                    maxheight = parseInt($textarea.css('max-height'), 10) || Number.MAX_VALUE,
                    goalheight = 0;

                // Opera returns max-height of -1 if not set
                if (maxheight < 0) { maxheight = Number.MAX_VALUE; }

                // Append the twin to the DOM
                // We are going to meassure the height of this, not the textarea.
                $twin.appendTo($textarea.parent());

                // Copy the essential styles (mimics) from the textarea to the twin
                var i = mimics.length;
                while (i--) {
                    $twin.css(mimics[i].toString(), $textarea.css(mimics[i].toString()));
                }

                // Updates the width of the twin. (solution for textareas with widths in percent)
                function setTwinWidth() {
                    var curatedWidth = Math.floor(parseInt($textarea.width(), 10));
                    if ($twin.width() !== curatedWidth) {
                        $twin.css({ 'width': curatedWidth + 'px' });

                        // Update height of textarea
                        update(true);
                    }
                }

                // Sets a given height and overflow state on the textarea
                function setHeightAndOverflow(height, overflow) {

                    var curratedHeight = Math.floor(parseInt(height, 10));
                    if ($textarea.height() !== curratedHeight) {
                        $textarea.css({ 'height': curratedHeight + 'px', 'overflow': overflow });
                    }
                }

                // This function will update the height of the textarea if necessary
                function update(forced) {

                    // Get curated content from the textarea.
                    var textareaContent = $textarea.val().replace(/&/g, '&amp;').replace(/ {2}/g, '&nbsp;').replace(/<|>/g, '&gt;').replace(/\n/g, '<br />');

                    // Compare curated content with curated twin.
                    var twinContent = $twin.html().replace(/<br>/ig, '<br />');

                    if (forced || textareaContent + '&nbsp;' !== twinContent) {

                        // Add an extra white space so new rows are added when you are at the end of a row.
                        $twin.html(textareaContent + '&nbsp;');

                        // Change textarea height if twin plus the height of one line differs more than 3 pixel from textarea height
                        if (Math.abs($twin.height() + lineHeight - $textarea.height()) > 3) {

                            var goalheight = $twin.height() + lineHeight;
                            if (goalheight >= maxheight) {
                                setHeightAndOverflow(maxheight, 'auto');
                            } else if (goalheight <= minheight) {
                                setHeightAndOverflow(minheight, 'hidden');
                            } else {
                                setHeightAndOverflow(goalheight, 'hidden');
                            }

                        }

                    }

                }

                // Hide scrollbars
                $textarea.css({ 'overflow': 'hidden' });

                // Update textarea size on keyup, change, cut and paste
                $textarea.bind('keyup change cut paste', function () {
                    update();
                });

                // Update width of twin if browser or textarea is resized (solution for textareas with widths in percent)
                $(window).bind('resize', setTwinWidth);
                $textarea.bind('resize', setTwinWidth);
                $textarea.bind('update', update);

                // Compact textarea on blur
                $textarea.bind('blur', function () {
                    if ($twin.height() < maxheight) {
                        if ($twin.height() > minheight) {
                            $textarea.height($twin.height());
                        } else {
                            $textarea.height(minheight);
                        }
                    }
                });

                // And this line is to catch the browser paste event
                $textarea.bind('input paste', function (e) { setTimeout(update, 250); });

                // Run update once when elastic is initialized
                update();

            });

        };

        $.fn.insertAtCaret = function (myValue) {
            return this.each(function (i) {
                if (document.selection) {
                    this.focus();
                    sel = document.selection.createRange();
                    sel.text = myValue;
                    this.focus();
                }
                else if (this.selectionStart || this.selectionStart == '0') {
                    var startPos = this.selectionStart;
                    var endPos = this.selectionEnd;
                    var scrollTop = this.scrollTop;
                    this.value = this.value.substring(0, startPos) + myValue + this.value.substring(endPos, this.value.length);
                    this.focus();
                    this.selectionStart = startPos + myValue.length;
                    this.selectionEnd = startPos + myValue.length;
                    this.scrollTop = scrollTop;
                } else {
                    this.value += myValue;
                    this.focus();
                }
            })
        };
    })();

    // Declare shotgun JQuery adapter.
    $.fn.shotgunConsole = function (options) {
        var $console = this,
            clientShell = new shotgun.ClientShell(options),
            cliText = '&gt;&nbsp;',
            $display = $('<div>').appendTo($console),
            $cliContainer = $('<div>')
                .css({ marginTop: '15px' })
                .appendTo($console),
            $cliText = $('<span>')
                .html(cliText)
                .appendTo($cliContainer),
            cliCss = {
                font: 'inherit',
                color: 'inherit',
                backgroundColor: 'transparent',
                width: '75%',
                border: 'none',
                outline: 'none',
                resize: 'none'
            },
            $singleLineCli = $('<input>')
                .attr('id', 'cli')
                .attr('type', 'text')
                .attr('autofocus', 'autofocus')
                .addClass('single-line cli')
                .css(cliCss)
                .focus(),
            $multiLineCli = $('<textarea>')
                .attr('id', 'cli')
                .attr('autofocus', 'autofocus')
                .addClass('multi-line cli')
                .css(cliCss)
                .css({
                    borderStyle: 'dotted',
                    borderWidth: '1px',
                    borderColor: 'inherit'
                })
                .hide(),
            $cli = $singleLineCli.appendTo($cliContainer),
            ui = {
                $console: $console,
                $display: $display,
                $cli: $cli,
                $cliText: $cliText,
                $cliContainer: $cliContainer,
                $scrollElement: $console
            },
            defaultSettings = {
                $scrollElement: $console
            },
            queue = [],
            processingQueue = false,
            cliHistory = [],
            cliIndex = -1,
            send,
            saveContext,
            api;

        // Override default settings with the supplied options.
        var settings = $.extend({}, defaultSettings, options);

        // If the user passed a string selector then turn it into a wrapped set.
        if (typeof(settings.$scrollElement) === 'string')
            settings.$scrollElement = $(settings.$scrollElement);

        // Attach specified scroll element to UI object.
        ui.$scrollElement = settings.$scrollElement;

        // Defaults
        saveContext = send = function () {
            return api;
        };

        // Setup api object to pass back.
        api = {
            onContextSave: function (callback) {
                saveContext = function (context) {
                    callback(context);
                    return api;
                };
                return api;
            },
            onData: function (callback) {
                send = function (data) {
                    callback(data);
                    return api;
                };
                return api;
            },
            execute: function (cmdStr, context, options) {
                clientShell.execute(cmdStr, context, options);
                return api;
            },
            clientShell: clientShell,
            ui: ui
        };

        // Declare function for parsing the data received from shotgun.
        function parseData() {

            // Set processingQueue to true.
            if (!processingQueue) processingQueue = true;

            // Declare a function to call when finished with this data object.
            function onComplete() {
                if (queue.length > 0)
                    parseData();
                else
                    processingQueue = false;
            }

            // Grab the next data item in the queue.
            var data = queue.shift();

            // If clearDisplay:true then empty the $display element.
            if (data.clearDisplay) $display.html('');

            // If password:true then change the $cli input type to password.
            if (data.password)
                $cli.attr('type', 'password');

            // If multiLine:true then change the $cli input to a textarea.
            if (data.multiLine) {
                $multiLineCli.val($cli.val());
                $singleLineCli.replaceWith($multiLineCli).hide();
                $multiLineCli.show().focus().elastic();
                $cli = $multiLineCli;
                $cliText.css({ verticalAlign: 'top' });
            }

            // If there is an edit property then insert its content into the CLI.
            if (data.edit)
                $cli.val(data.edit);
            // If there is a line object then display it.
            if (data.line) {
                var $line = $('<div>').addClass('line'),
                // Preserve multiple spaces and remove newline characters.
                // Browsers like to shrink multiple spaces down to a single space.
                    text = data.line.text.replace(/(  +)/g, function (match) {
                        return new Array(match.length + 1).join('&nbsp;');
                    }).replace(/(\r\n|\r|\n)/, '');

                // If text is empty then force a non-breaking space for compatibility with JQuery and coolType.
                text = text.length > 0 ? text : '&nbsp;';

                // Give the line of text a CSS class with the same name as the line type so it can be styled if needed.
                $line.addClass(data.line.type);
                if (data.line.options.inverted) $line.addClass('inverted');
                if (data.line.options.bold) $line.addClass('bold');
                if (data.line.options.italic) $line.addClass('italic');
                if (data.line.options.underline) $line.addClass('underline');
                if (data.line.options.cssRules) $line.attr('style', data.line.options.cssRules);
                $line.addClass(data.line.options.cssClass);
                $line.appendTo($display);

                // If coolType plugin is available and dontType:false then pass the text to coolType.
                if ('coolType' in $.fn && !data.line.options.dontType) {
                    // Default coolType options.
                    var coolTypeOptions = {
                        typeSpeed: 0,
                        delayBeforeType: 0,
                        delayAfterType: 0,
                        onComplete: onComplete
                    };
                    // If the command module specified coolType options then override the defaults with them.
                    if (data.line.options.coolTypeOptions)
                        $.extend(true, coolTypeOptions, data.line.options.coolTypeOptions);
                    // Pass the text and options to coolType.
                    $line.coolType(text, coolTypeOptions);
                }
                // Otherwise simply display the whole line instantly and invoke the callback immediately.
                else {
                    $line.html(text);
                    onComplete();
                }

                // Scroll to bottom.
                settings.$scrollElement.scrollTop(settings.$scrollElement[0].scrollHeight);
            }
            else
                onComplete();
        }

        // When the context is updated update the CLI text and invoke the saveContext callback.
        clientShell.onContextSave(function (context) {
            if (context.prompt)
                $cliText.html(context.prompt.msg + cliText);
            else
                $cliText.html(cliText);
            saveContext(context);
        });

        // When data is received call parseData and invoke the send callback.
        clientShell.onData(function (data) {
            queue.push(data);
            if (!processingQueue) parseData();
            send(data);
        });

        // Declare an enum for the keyboard input we are interested in.
        var keys = {
            enter: 13,
            upArrow: 38,
            downArrow: 40
        };

        // Implement CLI text history arrows.
        $cliContainer.keydown(function (e) {
            // Determine first and last lines in the multiLine input.
            var firstLine = $multiLineCli.val().indexOf('\n'),
                lastLine = $multiLineCli.val().lastIndexOf('\n'),
                cursor = $multiLineCli.getCursorPosition();

            switch (e.which) {

                case keys.enter:
                    // If there is no value on the input then do not execute.
                    if ($cli.val().length === 0 || e.shiftKey) break;
                    // Get user input.
                    var cliText = $cli.val();

                    // Send user input to shotgun shell.
                    clientShell.execute(cliText);

                    // If the $cli input type is password then set it back to regular text.
                    if ($cli.attr('type') === 'password')
                        $cli.attr('type', 'text');
                    // If the input is currently a textarea change it back to an input.
                    else if ($multiLineCli.is(":visible")) {
                        $multiLineCli.val('');
                        $singleLineCli.val($multiLineCli.val());
                        $multiLineCli.replaceWith($singleLineCli).hide();
                        $singleLineCli.show().focus();
                        $cli = $singleLineCli;
                        $cliText.css({ verticalAlign: 'none' });
                    }
                    // If the user input was not password data then add the user input to the CLI text history.
                    else
                        cliHistory.push(cliText);

                    // Clear the $cli input.
                    $cli.val('');

                    // Reset CLI history index.
                    cliIndex = -1;
                    break;

                case keys.upArrow:
                    // If multiline or password then don't do CLI history.
                    if ($multiLineCli.is(':visible') || $cli.attr('type') === 'password') break;

                    if (cliHistory.length > 0) {
                        if (cliIndex === -1)
                            cliIndex = cliHistory.length - 1;
                        else if (cliIndex > 0)
                            cliIndex--;
                    }

                    // Set cursor to end of content.
                    $cli.val(cliHistory[cliIndex]).setCursorPosition($cli.val().length);
                    break;

                case keys.downArrow:
                    // If multiline or password then don't do CLI history.
                    if ($multiLineCli.is(':visible') || $cli.attr('type') === 'password') break;

                    if (cliIndex < cliHistory.length - 1 && cliIndex > -1)
                        cliIndex++;
                    else if (cliIndex === cliHistory.length - 1)
                        cliIndex = -1;

                    // Set cursor to end of content.
                    $cli.val(cliHistory[cliIndex]).setCursorPosition($cli.val().length);
                    break;

            }
        });

        // Return our API object.
        return api;
    };
})(jQuery);