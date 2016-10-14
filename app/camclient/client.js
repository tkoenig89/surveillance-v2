#!/usr/bin/node
var mqtt = require("mqtt");
var fs = require("fs");
var msgHandler = require("../core/imageMessage");
var config = require("../core/config").load();
var clientId = process.argv[2] || config.client.identifier;

var client = mqtt.connect(config.broker.address, {
    clientId: clientId,
    username: config.broker.username || null,
    password: config.broker.password || null,
    clean: false
});

client.on("connect", function (connack) {
    getLatestImage();
});

function getLatestImage() {
    fs.readFile(config.client.imageLocation, handleFileContent);
}

/**
 * prepare and send file content via mqtt
 * @param {Error} err
 * @param {string} content
 * @returns
 */
function handleFileContent(err, content) {
    var payload, metaData;
    if (err) return console.log(err);
    
    //extract all data that should be transfered in addition to the file content
    metaData = {
        time: new Date(),
        ext: getFileExtension(config.client.imageLocation)
    };
    
    //merge meta and binary data
    payload = msgHandler.createMessage(metaData, content);

    //send the data
    client.publish(config.broker.topic + "/" + clientId, payload, { qos: 2 });

    //finally close the connection
    client.end();
}

/**
 * Extracts the file extension from the given path
 * @param {string} filePath
 * @returns {string}
 */
function getFileExtension(filePath) {
    return filePath.substr(filePath.lastIndexOf(".") + 1)
}

/**
 * Merges the metadata with the given filecontent to create a single string to be send via mqtt.
 * @param {Object} metaData
 * @param {Buffer} fileContent
 * @returns {string}
 */
function generatePayload(metaData, fileContent) {
    var bufferStr = fileContent.toString("base64");
    var metaStr = JSON.stringify(metaData);

    return metaStr + ";#" + bufferStr;
}