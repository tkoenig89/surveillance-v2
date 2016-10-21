#!/usr/bin/node
//this script will take the definition from the cronconf.json file and create a cron.d file from this 
var fs = require("fs");
var cronWrapper = require("../core/cronwrapper");
var configHelper = require("../core/config");

var config = configHelper.load(process.argv[2] || "config.json");

(function start() {
    var fContent = fs.readFileSync(config.maintenance.cron_conf_file, "utf8");
    var cronConf = JSON.parse(fContent);

    cronWrapper.update(cronConf, function (err) {
        if (err) return console.error("error", err);
        console.log("success");
    }, true);
})();
