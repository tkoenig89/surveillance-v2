#!/usr/bin/node
var mqtt = require("mqtt");
var fs = require("fs");
var msgHandler = require("../core/imageMessage");
var configHelper = require("../core/config");

//use either the first argument as configuration file or search for 'config.json' in the current folder
var config = configHelper.load(process.argv[2] || "config.json");

//init and start publisher
var mqttImagePublisher = new MqttImagePublisher(config);
mqttImagePublisher.start();

function MqttImagePublisher(config) {
    var client;
    this.start = start;

    function start() {
        initClient();
        setupEventlisteners();

        //exit if there did nothing happen after 30 seconds
        setTimeout(function () {
            closeProcess();
        }, 30000);
    }

    function initClient() {
        client = mqtt.connect(config.broker.address, {
            clientId: config.client.identifier,
            username: config.broker.username || null,
            password: config.broker.password || null,
            clean: true,
            ca: config.broker.ca ? [fs.readFileSync(config.broker.ca)] : null,
            checkServerIdentity: checkServerIdentityOverwrite
        });
    }

    /**
     * This will check that the connection is opened to a valid host.
     * If passing returns undefined, in all other cases it should return an error.
     * See here for more info: https://github.com/nodejs/node-v0.x-archive/commit/bf5e2f246eff55dfc33318f0ffb4572a56f7645a
     * @param {string} host
     * @param {Object} cer
     * @returns {Error}
     */
    function checkServerIdentityOverwrite(host, cer) {
        if (host === config.broker.hostname) {
            return undefined;
        } else {
            return Error("unknown host: " + host);
        };
    }

    function setupEventlisteners() {
        client.on("connect", getLatestImage);
    }


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
        client.publish(config.client.publish_topic, payload, { qos: config.client.publish_qos });

        //finally close the connection
        closeProcess();
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

    function closeProcess() {
        client.end();
        setTimeout(function () {
            process.exit();
        }, 1000);
    }
}