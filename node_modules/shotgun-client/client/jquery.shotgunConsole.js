(function ($) {

    // Declare shotgun JQuery adapter.
    $.fn.shotgunConsole = function (options) {
        var $console = this,
            clientShell = new shotgun.ClientShell(options),
            cliText = '&gt;&nbsp;',
            $display = $('<div>').appendTo($console),
            $cliContainer = $('<div>').appendTo($console),
            $cliText = $('<span>').html(cliText).appendTo($cliContainer),
            $cli = $('<input>')
                .attr('type', 'text')
                .attr('autofocus', 'autofocus')
                .css({
                    backgroundColor: 'transparent',
                    color: $console.css('color'),
                    fontSize: $console.css('font-size'),
                    width: '75%',
                    border: 'none',
                    outline: 'none',
                    marginTop: '20px'
                })
                .appendTo($cliContainer)
                .focus(),
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
                if (!$console.data('busy')) {
                    clientShell.execute(cmdStr, context, options);
                }
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

        $cli
            // Handle enter key and send CLI text to shotgun.
            .keypress(function (e) {
                if (e.which == keys.enter && !$console.data('busy') && $cli.val().length > 0) {
                    // Get user input.
                    var cliText = $cli.val();
                    // Send user input to shotgun shell.
                    clientShell.execute(cliText);
                    // If the $cli input type is password then set it back to regular text.
                    if ($cli.attr('type') === 'password')
                        $cli.attr('type', 'text');
                    // If the user input was not password data then add the user input to the CLI text history.
                    else
                        cliHistory.push(cliText);
                    // Clear the $cli input.
                    $cli.val('');
                    // Reset CLI history index.
                    cliIndex = -1;
                }
            })
            // Implement CLI text history arrows.
            .keydown(function (e) {
                if ($cli.attr('type') === 'password') return;
                switch (e.which) {
                    case keys.upArrow:
                        if (cliHistory.length > 0) {
                            if (cliIndex === -1)
                                cliIndex = cliHistory.length - 1;
                            else if (cliIndex > 0)
                                cliIndex--;
                        }
                        $cli.val(cliHistory[cliIndex]);
                        break;
                    case keys.downArrow:
                        if (cliIndex < cliHistory.length - 1 && cliIndex > -1)
                            cliIndex++;
                        else if (cliIndex === cliHistory.length - 1)
                            cliIndex = -1;
                        $cli.val(cliHistory[cliIndex]);
                        break;
                }
            });

        // Return our API object.
        return api;
    };
})(jQuery);