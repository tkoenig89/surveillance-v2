Schedule.parseCronSchedule = parseCronSchedule;
module.exports = Schedule;
// module.exports.parseCronSchedule = parseCronSchedule;

/**
 * Schedule that can create working cron schedules. Allows in addition to schedule in seconds.
 * @param {string} [sec=0]
 * @param {string} [min="*"]
 * @param {string} [hour="*"]
 * @param {string} [dayOfMonth="*"]
 * @param {string} [month="*"]
 * @param {string} [dayOfWeek="*"]
 * @returns {Schedule}
 */
function Schedule(sec, min, hour, dayOfMonth, month, dayOfWeek ) {
    var self = this;
    self.sec = sec || "";
    self.min = min;
    self.hour = hour;
    self.dayOfMonth = dayOfMonth;
    self.month = month;
    self.dayOfWeek = dayOfWeek;
    self.toCronSchedule = toCronSchedule;    

    /**
     * evaluates the possible values possible for a second
     * @returns {{kind:string,value:any}}
     */
    function parseSeconds() {
        if (!self.sec) {
            return null;
        } else {
            if (self.sec.indexOf("*/") === 0) {
                return {
                    kind: "iterator",
                    value: parseInt(self.sec.match(/\*\/(.+)/)[1])
                };
            } else {
                var secSplits = self.sec.split(",");
                var resultArray = [];
                for (var i = 0; i < secSplits.length; i++) {
                    var secSplit = secSplits[i];
                    if (secSplit.indexOf("-") >= 0) {
                        parseRange(secSplit, resultArray);
                    } else {
                        resultArray.push(parseInt(secSplit));
                    }
                }
                return {
                    kind: "enumerator",
                    value: resultArray
                }
            }
        }
    }

    /**
     * Evalutes a given range string. Appends all matching value into the given array.
     * @param {string} rangeString
     * @param {[number]} resultArray
     */
    function parseRange(rangeString, resultArray) {
        var range, min, max, divider = 1;
        range = rangeString.split("-");
        min = parseInt(range[0]);
        if (range[1].indexOf("/") >= 0) {
            var maxDivSplit = range[1].split("/");
            max = parseInt(maxDivSplit[0]);
            divider = parseInt(maxDivSplit[1]);
        } else {
            max = parseInt(range[1]);
        }
        for (var j = min; j <= max; j++) {
            if (j % divider === 0) {
                resultArray.push(j);
            }
        }
    }

    /**
     * Parses the Schedule into a valid cron schedule.
     * @param {string} user
     * @param {string} command
     * @returns {string}
     */
    function toCronSchedule(command, user) {
        var cronjob = "";

        handleSecondSchedule(function (sleep) {
            if (cronjob) cronjob += "\n";
            cronjob += createCronScheduleLine(user, command, sleep);
        });

        return cronjob;
    }

    /**
     * Takes care of evaluating all possible values for the second. Will call the callback with each value matching for the seconds expression.
     * @param {function(number)} callback
     */
    function handleSecondSchedule(callback) {
        var secHandle = parseSeconds();
        if (!secHandle) {
            callback();
        } else {
            if (secHandle.kind === "iterator") {
                for (var sleepTimer = 0; sleepTimer < 60; sleepTimer += secHandle.value) {
                    callback(sleepTimer);
                }
            } else if (secHandle.kind === "enumerator") {
                for (var i = 0; i < secHandle.value.length; i++) {
                    callback(secHandle.value[i]);
                }
            }
        }
    }

    /**
     * Creates a single cron schedule line.
     * @param {string} user
     * @param {string} command
     * @param {number} sleeptimer
     * @returns {string}
     */
    function createCronScheduleLine(user, command, sleeptimer) {
        var sleepCommand = sleeptimer ? "sleep " + sleeptimer + ";" : "";
        var cronScheduleString = [self.min, self.hour, self.dayOfMonth, self.month, self.dayOfWeek].join(" ");
        user = user ? user + " " : "";
        return cronScheduleString + " " + user + sleepCommand + command;
    }
}

/**
 * Takes a default cron schedule, with addition to a leading 'seconds' value, and creates a Schedule wrapper.' 
 * @param {string} strSchedule
 * @returns
 */
function parseCronSchedule(strSchedule) {
    var sec = 0, min = "*", hour = "*", dayOfMonth = "*", month = "*", dayOfWeek = "*";
    if (strSchedule) {
        var cronTimes = strSchedule.split(" ");
        var idx = 0;
        if (cronTimes.length === 6) {
            sec = cronTimes[idx];
            idx = 1;
        }
        min = cronTimes[idx];
        hour = cronTimes[idx + 1];
        dayOfMonth = cronTimes[idx + 2];
        month = cronTimes[idx + 3];
        dayOfWeek = cronTimes[idx + 4];
    }

    return new Schedule(sec, min, hour, dayOfMonth, month, dayOfWeek);
}
