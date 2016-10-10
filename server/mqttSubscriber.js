var mqtt = require("mqtt");
var fs = require("fs");
var config = require("../core/config").load();
var clientId = "server";
var imgPath = config.server.imageLocation;

var client = mqtt.connect(config.broker.address, {
    clientId: clientId,
    username: config.broker.username || null,
    password: config.broker.password || null,
    clean: true
});

client.on("connect", function (connack) {
    console.log("connected");
    if (connack.sessionPresent) {
        console.log("using existing session");
    } else {
        client.subscribe(config.broker.topic + "/#", { qos: 2 });
    }
});

client.on("message", function (topic, messageBuffer) {
    var data = parseMessage(messageBuffer);

    storeImage(data);
});

client.on("error", function (topic, messageBuffer) {
    console.log(topic, message);
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
    var fileName = date.getHours() + "_" + date.getMinutes() + "_" + date.getSeconds() + "." + data.ext;

    var targetPath = prepareImageLocation(config.server.imageLocation, fileName);
    console.log(targetPath);
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

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};