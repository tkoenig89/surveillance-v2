var mqtt = require("mqtt");
var fs = require("fs");
var clientId = "kamera1";
var imgPath = "C:\\Users\\Public\\Pictures\\Sample Pictures\\Hydrangeas.jpg";
var brokerAddress = "mqtt://raspitest:1337";
var topic = "stall/bilder/" + clientId;
var client = mqtt.connect(brokerAddress, {
    clientId: clientId,
    username: "stalluser"
});

client.on("connect", function (connack) {
    console.log("connected");
    getLatestImage();
});

function getLatestImage() {
    fs.readFile(imgPath, handleFileContent);
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