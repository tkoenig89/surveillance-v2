var wSocket = require("ws");
module.exports = {
    createWebSocket: createWebSocket
};

function createWebSocket(httpServer) {
    var wsServer = new wSocket.Server({
        server: httpServer
    });

    setupWebSocket();

    function setupWebSocket() {
        wsServer.on("connect", function (clientWs) {

        });
    }
}
