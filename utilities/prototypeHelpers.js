String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{([0-9]+)\}/g, function (match, index) {
        return args[parseInt(index)];
    });
};

Array.prototype.unique = function() {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr;
};