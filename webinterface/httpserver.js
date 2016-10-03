var http = require("http"),
    https = require("https"),
    url = require('url');

var httpServer = null;

module.exports = {
    createServer: createServer
};

function createServer(port, secureConfig) {
    if (secureConfig) {
        httpServer = https.createServer(secureConfig, onHttp);
    } else {
        httpServer = http.createServer(onHttp);
    }

    httpServer.listen(port);
    console.log("listening on port " + port);
    return httpServer;
}

function onHttp(req, resp) {
    resp.write("test");
    resp.end("Yeah");
}

