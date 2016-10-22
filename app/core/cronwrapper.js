var fs = require("fs");
var configHelper = require("./config");
var cronReader = require("./cron/cronreader");
var cronWriter = require("./cron/cronwriter");
var nodeCronFileName = "node_cron";

//use either the first argument as configuration file or search for 'config.json' in the current folder
var config = configHelper.load(process.argv[2] || "config.json");

//predefined commands, so no one can add arbitrary commands to the crontab
var allowedCronCommands = {
    IMAGE: ["pi", config.maintenance.script_folder + "/shootImage.sh " + config.maintenance.image_base_folder],
    CLEANUP: ["pi", config.maintenance.script_folder + "/cleanupImageFolder.sh " + config.maintenance.image_base_folder + "/history " + config.maintenance.cleanup_interval_minutes],
    UPLOAD: ["pi", config.maintenance.path_to_node + " " + config.maintenance.script_folder + "/client.js " + config.maintenance.path_to_config]
};

module.exports = {
    update: update
};

function update(cronConfiguration, callback, addIfMissing) {
    cronReader.parseCronDFile(nodeCronFileName, function (err, cronStorage) {
        if (err) return callback(err);

        //update cron jobs
        for (var i = 0; i < cronConfiguration.length; i++) {
            parseConfig(cronConfiguration[i], cronStorage, addIfMissing);
        }

        //write to file
        cronWriter.writeCronFile(nodeCronFileName, cronStorage.getList());
        callback(null)
    });
}

function parseConfig(cronConf, cronStorage, addIfMissing) {
    var command = allowedCronCommands[cronConf.cmd][1];
    var user = allowedCronCommands[cronConf.cmd][0];

    cronStorage.updateCron(command, user, cronConf.schedule, addIfMissing);
}