exports.description = "Actives a highly advanced graphical user interface for U413.";

exports.roles = 'admin';

exports.options = {
    exit: {
        aliases: 'x',
        description: 'Deactivates GUI'
    }
};

exports.invoke = function (shell, options) {
    if (!options.hasOwnProperty('exit')) {
        shell.setVar('gui', true);
        shell.clearDisplay();
        shell.hideCli();
        shell.view('gui/home', {}, { dontScroll: true });
    }
    else {
        shell.delVar('gui');
        shell.showCli();
        shell.execute('initialize');
    }
};