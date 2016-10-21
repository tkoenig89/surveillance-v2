var fs = require("fs");
var os = require("os");
var cron_utils = require("./cron.utils");
var CronStorage = cron_utils.CronStorage;
var CronLine = cron_utils.CronLine;
var Schedule = require("./schedule");

module.exports = {
    parseCronDFile: parseCronDFile
};

function parseCronDFile(fileName, callback) {
    var filePath = "/etc/cron.d/" + fileName;
    if (fs.existsSync(filePath)) {
        fs.readFile(filePath, "utf8", function (err, content) {
            if (err) {
                callback(err);
            }
            else {
                var cronjobs = findCronLines(content);
                callback(null, cronjobs);
            }
        });
    } else {
        callback(null, CronStorage());
    }
}

/**
 * Takes the content of the cronfile and returns an array of matches.
 * @param {string} content
 * @returns {CronStorage}
 */
function findCronLines(content) {
    var lines = content.split(os.EOL);
    var cronStorage = CronStorage();
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line && line.indexOf('#') !== 0) {
            var parsedLine = parseLine(line);
            if (parsedLine) {
                var command = parsedLine[9];
                var user = parsedLine[7];
                var cronExpr = parsedLine[1];
                var seconds = parsedLine[8];
                var schedule = new Schedule(parsedLine[8], parsedLine[2], parsedLine[3], parsedLine[4], parsedLine[5], parsedLine[6]);

                var cron = new CronLine(schedule, user, command, cronExpr);
                cronStorage.addCron(cron);
            }
        }
    }
    return cronStorage;
}


/**
 * 
 * 
 * @param {string} line
 */
function parseLine(line) {
    return line.match(/(([^\s]+)\s([^\s]+)\s([^\s]+)\s([^\s]+)\s([^\s]+))\s(\w+)\s(?:sleep\s(\d+);)?(.+)/);
}