// "this" === shotgun shell instance
module.exports = exports = {

    // Create a shell helper function for setting cookies on the client.
    setCookie: function (name, value, days) {
        var newCookies = this.getVar('newCookies') || {};
        newCookies[name] = { value: value, days: days };
        return this.setVar('newCookies', newCookies);
    },

    // Create a shell helper function for retrieving a cookie.
    getCookie: function (name) {
        var cookies = this.getVar('cookies');
        if (!cookies) return;
        if (cookies.hasOwnProperty(name)) return cookies[name];
    },

    // Create a shell helper function for deleting a cookie.
    delCookie: function (name) {
        this.setCookie(name, null, -1);
    },

    // Create a shell send function that will broadcast to all clients.
    sendToAll: function (data) {
        var shell = this;
        shell.io.of('/' + shell.settings.namespace).emit('data', data);
    },

    // Create a shell send function that will broadcast to all clients except the current one.
    sendToOthers: function (data) {
        var shell = this,
            socket = shell.getVar('socket');
        socket.broadcast.emit('data', data);
    },

    // Create a shell send function for multi line inputs.
    multiLine: function () {
        var shell = this;
        shell.send({ multiLine: true });
    }
};