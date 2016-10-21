var fs = require("fs");
module.exports = CronWriter();

function CronWriter() {
    var PATH = "/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin";
    var SHELL = "/bin/sh\n";

    return {
        writeCronFile: writeCronFile,
        setPath: setPath,
        setShell: setShell
    };

    function writeCronFile(filename, crons, desciption) {
        var content = createFileContent(crons, desciption);
        fs.writeFileSync("/etc/cron.d/" + filename, content);
    }

    function createFileContent(crons, desciption) {
        var content = createFileHeader(desciption);
        for (var i = 0; i < crons.length; i++) {
            content += crons[i].toString() + "\n";
        }
        return content;
    }

    function createFileHeader(desciption) {
        return (desciption ? "#" + desciption.replace("\n", "\n#") + "\n\n" : "") + "PATH=" + PATH + "\nSHELL=" + SHELL + "\n\n";
    }

    function setShell(shell) {
        SHELL = shell;
    }

    function setPath(path) {
        PATH = path;
    }
}
