const WebSocket = require('ws')

var WebSocketServer = WebSocket.Server,
    wss = new WebSocketServer({port: 8082}),
    CLIENTS=[];
wss.on('connection', (ws, req) => {
  CLIENTS.push(ws)
  ws.on('message', message => {
    console.log(`Received message => ${message}`)
    console.log(CLIENTS)
  })
  ws.send('ho!')
})

