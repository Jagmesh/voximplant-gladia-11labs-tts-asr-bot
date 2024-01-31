const {WebSocket} = require("ws");
const {LogService} = require("../services/log.service");

async function handleOutgoingWebsocket(incomingSocket) {
    const outWebSocket = new WebSocket(process.env.GLADIA_API_WSS_URL + '/audio/text/audio-transcription');
    let startTimeMeasure;

    outWebSocket.on('error', (error)=> {
        LogService.error(error, 'outWebSocket')
    });

    outWebSocket.on('close',  (closeCode, closeMessage) => {
        LogService.write(`Connection is closed. CloseCode: ${closeCode}, closeMessage: ${closeMessage}`, 'outWebSocket')
        outWebSocket.close();
    })

    outWebSocket.on('message', (event) => {
        LogService.write(`Received message: ${event}.`, 'outWebSocket');

        const utterance = JSON.parse(event.toString());
        if(!utterance['transcription'] || !utterance['type']) return;

        if(!startTimeMeasure) startTimeMeasure = new Date() // Track start time of the first message with non-empty transcription

        if(utterance['type'] !== 'final') return;
        LogService.write(`Transcription result: ${utterance['transcription']}`, 'outWebSocket')
        LogService.write(`Time taken to process ASR: ${(new Date() - startTimeMeasure) / 1000} seconds`, 'outWebSocket / ASR')
        startTimeMeasure = null;

        incomingSocket.send(utterance['transcription'])
    });

    await connectToGladia(outWebSocket)

    return outWebSocket;
}

function connectToGladia(outWebSocket) {
    return new Promise((resolve) => {
        outWebSocket.on('open',  () => {
            LogService.write('Connected to Gladia.io', 'outWebSocket')
            outWebSocket.send(JSON.stringify({
                x_gladia_key:  process.env.GLADIA_API_KEY,
                encoding: 'WAV/ULAW',
                language_behaviour: 'manual',
                language : 'english',
                model_type: 'accurate'
            }));
            resolve()
        });
    })
}

module.exports = {handleOutgoingWebsocket}