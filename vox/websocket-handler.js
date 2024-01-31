require(Modules.WebSocket);

const WSS_URL = 'wss://158.160.77.242:3000';
const TTS_URL = 'http://158.160.77.242:4000/tts'

VoxEngine.addEventListener(AppEvents.CallAlerting, ({ call: inCall }) => {
    const webSocket = VoxEngine.createWebSocket(WSS_URL);

    webSocket.addEventListener(WebSocketEvents.ERROR, (e) => {
        Logger.write(`[LOGGER] Connection Error: ${JSON.stringify(e)}`);
        endSession();
    });
    webSocket.addEventListener(WebSocketEvents.CLOSE, () => {
        Logger.write(`[LOGGER] Connection closed with ${WSS_URL}`);
        endSession();
    });
    webSocket.addEventListener(WebSocketEvents.OPEN, () => {
        Logger.write(`[LOGGER] Connection established with ${WSS_URL}`);
    });

    webSocket.addEventListener(WebSocketEvents.MESSAGE, async ({ text }) => {
        Logger.write(`[LOGGER] Recieved MESSAGE ${text} from ${WSS_URL}`);

        // handling first message from server and start sending data from call to server
        if (text === 'Hi there, I am a WebSocket server') {
            inCall.sendMediaTo(webSocket, {
                encoding: WebSocketAudioEncoding.ULAW,
            });
            return;
        }


        await sayCustom(TTS_URL+`?text=${encodeURI(text.trim())}`, inCall);

    });

    inCall.addEventListener(CallEvents.Disconnected, handleInDisconnected);
    inCall.answer();
});

function handleInDisconnected() {
    Logger.write('[LOGGER] Handling disconnected of inbound call');
    endSession();
}

function endSession() {
    VoxEngine.terminate();
}

function sayCustom(url, call) {
    return new Promise((resolve) => {
        call.startPlayback(url);

        const startTimeMeasure = new Date()
        call.addEventListener(CallEvents.PlaybackReady, function playbackCallback() {
            Logger.write(`[LOGGER] Time taken to synthesize TTS: ${(new Date() - startTimeMeasure) / 1000} seconds`)
            call.removeEventListener(CallEvents.PlaybackReady, playbackCallback)
        })

        call.addEventListener(CallEvents.PlaybackFinished, function callback() {
            resolve(call.removeEventListener(CallEvents.PlaybackFinished, callback));
        });
    });
}
