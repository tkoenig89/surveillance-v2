#!/usr/bin/node
var mqtt = require("mqtt");
var fs = require("fs");
var configHelper = require("../core/config");
var cronWrapper = require("../core/cronwrapper");

//use either the first argument as configuration file or search for 'config.json' in the current folder
var config = configHelper.load(process.argv[2] || "config.json");

//init and start publisher
var maintenanceClient = new MaintenanceClient(config);
maintenanceClient.start();

function MaintenanceClient(config) {
    var client;
    this.start = start;

    function start() {
        initClient();
        setupEventlisteners();

        //exit if there did nothing happen after 30 seconds
        setTimeout(function () {
            client.end();
        }, 30000);
    }

    function initClient() {
        client = mqtt.connect(config.broker.address, {
            clientId: config.client.identifier + "_m",
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
        client.on("message", onMessage);
    }

    function onMessage(topic, messageBuffer) {
        if (topic === config.maintenance.cron_topic) {
            updateCronJobs(messageBuffer.toString());
        }
    }

    function onConnect(connack) {
        client.subscribe(config.maintenance.cron_topic);
    }

    function updateCronJobs(strMessage) {
        try {
            var cronConfig = JSON.parse(strMessage);
            if (cronConfig && cronConfig.length > 0) {
                var compareResult = compareConfiguration(cronConfig);
                if (compareResult.hasChanged) {
                    cronWrapper.update(compareResult.config, function (err) {
                        if (!err) {
                            fs.writeFileSync(config.maintenance.cron_conf_file, JSON.stringify(compareResult.config), "utf8");
                        }
                    });
                }
            }
        } catch (ex) {

        }
    }

    function compareConfiguration(cronConfig) {
        var hasChanged = false;
        var fContent = fs.readFileSync(config.maintenance.cron_conf_file, "utf8");
        var oldConfig = JSON.parse(fContent);

        for (var i = 0; i < cronConfig.length; i++) {
            for (var j = 0; j < oldConfig.length; j++) {
                if (cronConfig[i].cmd === oldConfig[j].cmd) {
                    if (cronConfig[i].schedule !== oldConfig[j].schedule) {
                        hasChanged = true;
                        oldConfig[j].schedule = cronConfig[i].schedule;
                    }
                }
            }
        }

        return {
            hasChanged: hasChanged,
            config: oldConfig
        };
    }
}