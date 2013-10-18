(function ($) {
    $(function () {
        $(document).on('click', '.cmdLink', function () {
            var cmdStr = $(this).data('cmd'),
                api = $('#frame').data('api');

            console.log(cmdStr);
            api.clientShell.execute(cmdStr);
        });
    });
})(jQuery);