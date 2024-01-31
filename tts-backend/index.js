require('dotenv').config()
const axios = require("axios");
const {LogService} = require("./services/log.service");
const app = require('express')();

app.get('/tts', async (req, res) => {
    const messageText = req?.query?.text
    if(!messageText) {
        res.status(500).send({ error: 'Missing params: text' });
        return;
    }

    LogService.write(`Received request with message: ${messageText}`, 'TTS')

    const {headers, data} = await generateTTSfile(messageText)
    res.set(headers).send(data);
})
app.listen(process.env.APP_PORT, () => {
    LogService.write(`Listening on PORT ${process.env.APP_PORT}`);
});

async function generateTTSfile(messageText){
    const config = {
        method: 'POST',
        url: process.env.ELEVENLABS_API_URL,
        headers: {
            accept: 'audio/mp3',
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVENLABS_XI_API_KEY,
        },
        data: {
            text: messageText,
            voice_settings: {
                similarity_boost: 0,
                stability: 1
            },
        },
        responseType: 'arraybuffer',
    };

    const {headers, data} = await axios(config)
    return {headers , data};
}