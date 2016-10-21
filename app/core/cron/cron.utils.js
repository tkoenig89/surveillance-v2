var Schedule = require("./schedule");
module.exports = {
    CronStorage: CronStorage,
    CronLine: CronLine
};

/**
 * Creates a container to store cron jobs. Allows updating and removing from the list.
 * @returns 
 */
function CronStorage() {
    var crons = [];

    return {
        addCron: addCron,
        updateCron: updateCron,
        removeCron: removeCron,
        getList: getList,
        toString: toString
    };

    function toString() {
        var str = "";
        for (var i = 0; i < crons.length; i++) {
            var elem = crons[i];
            str += elem.toString() + "\n";
        }
        return str;
    }

    function getList() {
        return crons;
    }

    function addCron(cronJobOrCommand, user, schedule) {
        if (!user && !schedule) {
            addExistingCron(cronJobOrCommand);
        } else if (cronJobOrCommand && user && schedule) {
            //create new cronjob
            var newCron = new CronLine(Schedule.parseCronSchedule(schedule), user, cronJobOrCommand);
            addExistingCron(newCron);
        }
    }

    function addExistingCron(cronJob) {
        var existing = findExistingCronTestingEverything(cronJob);
        if (!existing) {
            crons.push(cronJob);
        } else if (cronJob.schedule.sec) {
            mergeCronJobs(existing, cronJob);
        }
    }

    function updateCron(command, user, newScheduleString, addIfMissing) {
        var oldCron = findCronByCommandAndUser(command, user);
        if (oldCron) {
            oldCron.schedule = Schedule.parseCronSchedule(newScheduleString);
            return true;
        } else if (addIfMissing) {
            addCron(command, user, newScheduleString);
        }
        return false;
    }

    function removeCron(command, user) {
        var index = findCronByCommandAndUser(command, user, true);
        if (index >= 0) {
            crons.splice(index, 1);
        }
    }

    function mergeCronJobs(baseCron, newCron) {
        if (!baseCron.schedule.sec) {
            baseCron.schedule.sec = "0";
        }
        baseCron.schedule.sec += "," + newCron.schedule.sec;
    }

    function findCronByCommandAndUser(command, user, getIdx) {
        for (var i = 0; i < crons.length; i++) {
            var elem = crons[i];
            if (elem.command === command && elem.user === user) {
                if (getIdx) {
                    return i;
                } else {
                    return elem;
                }
            }
        }
        return getIdx ? -1 : null;
    }

    function findExistingCronTestingEverything(cron) {
        for (var i = 0; i < crons.length; i++) {
            var elem = crons[i];
            if (elem.command === cron.command && elem.user === cron.user && elem.cronExpr === cron.cronExpr) {
                return elem;
            }
        }
        return null;
    }
}

/**
 * 
 * 
 * @param {Schedule} schedule
 * @param {string} command
 * @param {string} user
 * @param {string} cronExpr
 */
function CronLine(schedule, user, command, cronExpr) {
    this.schedule = schedule;
    this.command = command;
    this.user = user;
    this.cronExpr = cronExpr || ([schedule.min, schedule.hour, schedule.dayOfMonth, schedule.month, schedule.dayOfWeek].join(" "));
}
CronLine.prototype.toString = CronLinetoString;

/**
 * Generates a string representation
 * @returns {string}
 */
function CronLinetoString() {
    return this.schedule.toCronSchedule(this.command, this.user);
}