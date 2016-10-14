module.exports = {
    createMessage: createMessage,
    parseMessage: parseMessage
};

/**
 * 
 * @param {Object} metaData
 * @param {Buffer} fileContent
 * @returns {string}
 */
function createMessage(metaData, fileContent) {
    var bufferStr = fileContent.toString("base64");
    var metaStr = JSON.stringify(metaData);

    return metaStr + ";#" + bufferStr;
}

/**
 * 
 * @param {Buffer} messageBuffer
 * @returns {{buffer:Buffer, time: string, ext:string}}
 */
function parseMessage(messageBuffer) {
    var str = messageBuffer.toString("utf-8");
    var meta = str.substr(0, str.indexOf(";#"));
    var fileBuffer = str.substr(str.indexOf(";#") + 2);
    var metaObject = JSON.parse(meta);
    metaObject.buffer = new Buffer(fileBuffer, "base64");
    return metaObject;
}