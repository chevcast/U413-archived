exports.roles = 'all';

exports.description = "Displays information about U413 including history.";

exports.invoke = function(shell) {
    shell.clearDisplay();
    shell.view('aboutU413');
};