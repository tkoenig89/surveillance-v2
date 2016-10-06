var mqtt = require("mqtt");
var fs = require("fs");
var clientId = "server";
var imgPath = "";
var brokerAddress = "mqtt://raspitest:1337";
var topic = "stall/bilder/#";

var client = mqtt.connect(brokerAddress, {
    clientId: clientId,
    username: "stalluser",
    clean: false
});

client.on("connect", function (connack) {
    console.log("connected");
    if (connack.sessionPresent) {
        console.log("using existing session");
    } else {
        client.subscribe(topic, {
            qos: 2
        });
    }
});

client.on("message", function (topic, messageBuffer) {
    var data = parseMessage(messageBuffer);

    storeImage(data);
});

function parseMessage(messageBuffer) {
    var str = messageBuffer.toString("utf-8");
    var meta = str.substr(0, str.indexOf(";#"));
    var fileBuffer = str.substr(str.indexOf(";#") + 2);
    var metaObject = JSON.parse(meta);
    metaObject.buffer = new Buffer(fileBuffer, "base64");
    return metaObject;
}

function storeImage(data) {
    var date = new Date(data.time);
    var fileName = date.getHours() + "_" + date.getMinutes() + "_" + date.getSeconds() + ".jpg";
    console.log(fileName);

    fs.writeFile(fileName, data.buffer);
}