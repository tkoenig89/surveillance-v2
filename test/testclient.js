#!/usr/bin/node
var mqtt = require("mqtt");
var fs = require("fs");
var configHelper = require("../app/core/config");

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
            clientId: config.server.identifier + "_sniffer",
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
        console.log(topic);
        if (topic.indexOf("bilder") === -1) {
            console.log(messageBuffer.toString());
        }
        console.log("----------------------------------------------------------------------");
    }

    function onConnect(connack) {
        if (!connack.sessionPresent) {
            addSubscibtions();
        }
    }

    function addSubscibtions() {
        client.subscribe("stall/#");
    }

    function onError(err) {

    }
}