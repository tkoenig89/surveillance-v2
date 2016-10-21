#!/usr/bin/node
var mqtt = require("mqtt");
var fs = require("fs");
var configHelper = require("../core/config");

//use either the first argument as configuration file or search for 'config.json' in the current folder
var config = configHelper.load(process.argv[2] || "config.json");

//init and start publisher
var mqttPublisher = new MqttPublisher(config);
mqttPublisher.start();

function MqttPublisher(config) {
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
            clientId: config.client.identifier + "_r",
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
        client.on("connect", onConnect);
    }

    function closeProcess() {
        client.end();
        setTimeout(function () {
            process.exit();
        }, 1000);
    }

    function onConnect(connack) {
        client.publish(config.maintenance.cron_topic, JSON.stringify(
            [{
                cmd: "IMAGE", schedule: "5 * * * * *"
            }]
        ));
        setTimeout(closeProcess, 10000);
    }
}