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
        data.cameraName = cameraNameFromTopic(topic);
        storeImage(data);
    }

    function onConnect(connack) {
        if (!connack.sessionPresent) {
            client.subscribe(config.server.subscribe_topic, { qos: config.server.subscribe_qos });
        }
    }

    /**
     * Extracts the name of the sending camera from the topic
     * @param {string} topic
     * @returns {string}
     */
    function cameraNameFromTopic(topic) {
        var topicSplit = topic.split("/");
        if (topicSplit.length >= 2) {
            return topicSplit[topicSplit.length - 2];
        } else {
            return "unknwon";
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

        //keep one file in the camera folder
        keepLatestInTopFolder(cameraFolderPath, fileName, data.buffer);
    }

    function keepLatestInTopFolder(cameraFolderPath, fileName, dataBuffer) {
        var latestFilePath = concatFilepath(cameraFolderPath, fileName);
        fs.writeFile(latestFilePath, dataBuffer, function (err) {
            if (err) return console.log(err);
            var latestFileStorage = concatFilepath(cameraFolderPath, "latestFileName");

            //remove the old file and store the name of the new file
            fs.readFile(latestFileStorage, function (readErr, oldLatestFile) {
                if (err) return console.log(readErr);
                fs.unlink(oldLatestFile);
                fs.writeFileSync(latestFileStorage, latestFilePath);
            });
        });
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

if (typeof (String.endsWith) === undefined) {
    String.prototype.endsWith = function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}