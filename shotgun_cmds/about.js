exports.roles = 'all';

exports.description = "Displays information about U413 including history.";

exports.invoke = function(shell) {
    shell.clearDisplay();
    var isGui = shell.getVar('gui');
    if (isGui)
        shell.view('gui/about', {}, { dontScroll: true });
    else
        shell.view('aboutU413');
};