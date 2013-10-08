exports.roles = 'user';

exports.description = "Allows you to create command macros.";

exports.invoke = function(shell) {
    shell.warn("The macro command is unfinished. When complete it will allow you to create macros for user input. If you use a particular command with a specific set of options a lot then you can create a macro that will make it easier for you to execute that specific command with the desired options.");
};