#!/usr/bin/node
var mqtt = require("mqtt");
var fs = require("fs");
var msgHandler = require("../core/imageMessage");
var configHelper = require("../core/config");

//use either the first argument as configuration file or search for 'config.json' in the current folder
var config = configHelper.load(process.argv[2] || "config.json");

//init and start subscriber
var mqttImageSubscriber = new MqttImageSubscriber(config);
mqttImageSubscriber.start();

/**
 * This 
 * @param {Object} config
 */
function MqttImageSubscriber(config) {
    var client;

    this.start = start;

    function start() {
        initClient();
        setupEventlisteners();
    }
    function initClient() {
        client = mqtt.connect(config.broker.address, {
            clientId: config.server.identifier,
            username: config.broker.username || null,
            password: config.broker.password || null,
            clean: config.server.clean_session,
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
        client.on("connect", onConnect);
        client.on("message", onMessage);
        client.on("error", onError);
    }

    function onMessage(topic, messageBuffer) {
        var data = msgHandler.parseMessage(messageBuffer);
        var topicSplit = topic.split("/");
        data.cameraName = topicSplit[topicSplit.length - 1];
        storeImage(data);
    }

    function onConnect(connack) {
        if (!connack.sessionPresent) {
            client.subscribe(config.server.subscribe_topic, { qos: config.server.subscribe_qos });
        }
    }

    function onError(err) {

    }

    /**
     * 
     * @param {{buffer:Buffer, time: string, ext:string, cameraName: string}} data
     */
    function storeImage(data) {
        var date = new Date(data.time);

        //create camera directory path 
        var cameraFolderPath = ensureFolderPath(config.server.imageLocation, data.cameraName);

        //create date folder path
        var folderName = "" + date.getFullYear() + padNumber(date.getMonth() + 1) + padNumber(date.getDate());
        var targetFolderPath = ensureFolderPath(cameraFolderPath, folderName);

        //create file path
        var fileName = padNumber(date.getHours()) + "_" + padNumber(date.getMinutes()) + "_" + padNumber(date.getSeconds()) + "." + data.ext;
        var targetFilePath = concatFilepath(targetFolderPath, fileName);
        fs.writeFile(targetFilePath, data.buffer);
    }

    /**
     * Concatenates the given paths and creates the folder if not already existing
     * @param {string} parentFolderPath
     * @param {string} folderName
     * @returns {string} concatenated path
     */
    function ensureFolderPath(parentFolderPath, folderName) {
        var folderPath = concatFilepath(parentFolderPath, folderName);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
        return folderPath;
    }

    function concatFilepath(folder, fileName) {
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
}

function padNumber(nmbr) {
    if (nmbr < 10) {
        return "0" + nmbr;
    } else {
        return "" + nmbr;
    }
}

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};