require('dotenv').config()
const app = require('express')();
const fs = require("fs");
const https = require('https')
const {LogService} = require("./services/log.service.js");
const {handleIncomingWebsocket} = require("./websocket/incoming-ws");

const server = https.createServer({
    key: fs.readFileSync('cert/privateKey.key'),
    cert: fs.readFileSync('cert/certificate.crt'),
}, app);

handleIncomingWebsocket(server);

server.listen(process.env.APP_PORT, function() {
    LogService.write(`Listening on PORT ${process.env.APP_PORT}`);
});