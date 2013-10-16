Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};

// White-list of global variables the repl will have access to.
var allowedGlobals = ['_', 'ArrayBuffer', 'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array',
    'Int32Array', 'Uint32Array', 'Float32Array', 'Float64Array', 'DataView', 'Buffer', 'console', 'setTimeout',
    'clearTimeout', 'setInterval', 'clearInterval'];

// White-list of repl command that are available.
var allowedReplCmds = ['.break', '.clear', '.help'];

// If the user is not an admin then remove access to built-in core node modules.
if (!isAdmin)
    repl._builtinLibs = [];
// Start the repl and get reference to the repl instance.
var replInstance = repl.start({ prompt: '', ignoreUndefined: true, input: inputStream, output: outputStream });
// If the user is not an admin then iterate over the variables in the repl context and the repl commands, then
// remove any that are not white-listed.
if (!isAdmin) {
    for (var key in replInstance.commands)
        if (!allowedReplCmds.contains(key))
            delete replInstance.commands[key];
    for (var key in replInstance.context)
        if (!allowedGlobals.contains(key))
            delete replInstance.context[key];
}