const {WebSocketServer} = require("ws");
const {LogService} = require("../services/log.service");
const {handleOutgoingWebsocket} = require("./outgoing-ws");


function handleIncomingWebsocket(server) {
    const webSocketServer = new WebSocketServer({server})

    webSocketServer.on('connection', async (socket, request, client) => {
        LogService.write(`Recieved incoming connection from ${socket._socket.remoteAddress}`, 'webSocketServer')

        // creating an outgoing webSocket connection with Gladia.io when we receive an incoming webSocket connection
        const outWebSocket = await handleOutgoingWebsocket(socket)

        socket.on('close', async (message) => {
            LogService.write(`The incoming connection from ${socket._socket.remoteAddress} closed`, 'webSocketServer');
            outWebSocket.close(1000, 'Incoming webSocket connection is closed and we are closing this webSocket connection')
        })

        socket.on('message', (message) => {
            let data;
            try {
                data = JSON.parse(message)
            } catch(error) {
                LogService.error(`Failed parsing message: ${error}`, 'webSocketServer')
                return;
            }

            if(!data?.media?.payload) {
                LogService.write('There is no media payload in recieved message. Skipping', 'webSocketServer')
                return;
            }

            const base64data = new Buffer.from(data.media.payload, 'base64')
            outWebSocket.send(JSON.stringify({ frames: base64data }))
        });

        socket.send('Hi there, I am a WebSocket server');
    });
}

module.exports = {handleIncomingWebsocket}