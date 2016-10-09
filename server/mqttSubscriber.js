var mqtt = require("mqtt");
var fs = require("fs");
var config = require("../core/config").load();
var clientId = "server";
var imgPath = config.server.imageLocation;
var topic = "stall/bilder/#";

var client = mqtt.connect(config.broker.address, {
    clientId: clientId,
    username: config.broker.username || null,
    password: config.broker.username || null,
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


    var targetPath = prepareImageLocation(config.server.imageLocation, fileName);
    fs.writeFile(targetPath, data.buffer);
}

function prepareImageLocation(folder, fileName) {
    if (!folder) {
        return fileName;
    } else {
        if (folder.endsWith("/")) {
            return folder + fileName;
        } else {
            return folder + "/" + fileName;
        }
    }
}