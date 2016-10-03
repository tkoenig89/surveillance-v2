var fs = require("fs"),
    config = require("../core/config").load(),
    camViewerServer = require("../webinterface/httpserver"),
    webSocketServer = require("./cameraServer");

activate();

function activate(){
    var secureConfig = null;

    if (config.keyFile && config.certFile) {
        var privateKey = fs.readFileSync(config.keyFile, 'utf8');
        var certificate = fs.readFileSync(config.certFile, 'utf8');
        secureConfig = {
            key: privateKey,
            cert: certificate
        };
    }

    //create either an https or http server
    var httpServer = camViewerServer.createServer(config.server.port, secureConfig)

    //add the websocket server
    webSocketServer.createWebSocket(httpServer);
}