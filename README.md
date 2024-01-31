### `/tts-backend`

Server that receives incoming requests for TTS with `text` param and send a mp3 file as a response 


### `/vox`

Platform VoxEngine scenario. Accepts call, sends media to WebSocket server, receives text, synthesizes speech 
and plays it in incoming call

### `/websocket-backend`

WebSocket server that receives incoming connection from VoxEngine scenario (from `/vox`) and creates outgoing webSocket
connection to ASR provider

