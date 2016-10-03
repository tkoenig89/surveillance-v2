var fs = require("fs");
var config = null;

/**
 * 
 * @returns {Object
 */
function load(file) {
    if (!config) {
        file = file || __dirname + "\\..\\config.json";
        config = getConfigFromFile(file, "UTF-8")
    }
    return config;
}

function getConfigFromFile(filename) {
    var configContent = fs.readFileSync(filename);
    if (configContent) {
        return JSON.parse(configContent);
    }
    return undefined;
}

module.exports = {
    load: load
}