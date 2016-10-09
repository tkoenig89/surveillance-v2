var mqtt = require("mqtt");
var fs = require("fs");
var config = require("../core/config").load();
var clientId = "kamera1";
var topic = "stall/bilder/" + clientId;

var client = mqtt.connect(config.broker.address, {
    clientId: clientId,
    username: config.broker.username || null,
    password: config.broker.username || null,
    clean: false
});

client.on("connect", function (connack) {
    console.log("connected");
    getLatestImage();
});

function getLatestImage() {
    fs.readFile(config.client.imageLocation, handleFileContent);
}

function handleFileContent(err, content) {
    if (err) return console.log(err);

    var payload = generatePayload({ time: new Date() }, content);
    client.publish(topic, payload, {
        qos: 2
    });

    client.end();
}

function generatePayload(metaData, fileContent) {
    var bufferStr = fileContent.toString("base64");
    var metaStr = JSON.stringify(metaData);

    return metaStr + ";#" + bufferStr;
}