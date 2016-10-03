var CONST = {
    SERVICE_URL: "localhost",
    SERVICE_PORT: 8080,
    SECURE_CONNECTION: false,
    TOKEN_HEADER: "security-token"
};

if (typeof (module) !== "undefined" && module.exports) {
    module.exports = CONST;
}