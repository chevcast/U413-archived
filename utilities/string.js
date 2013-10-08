String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{([0-9]+)\}/g, function (match, index) {
        return args[parseInt(index)];
    });
};