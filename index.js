const WebSocket = require('ws')
var uuid = require('uuid')

var WebSocketServer = WebSocket.Server,
    wss = new WebSocketServer({port: 8082}),
    CLIENTS=[];
wss.on('connection', (ws, req) => {
  // CLIENTS.push(ws)
  ws.id = uuid.v4();
  console.log(ws.id)
  ws.on('message', message => {
    console.log(`Received message => ${message}`)
    console.log(ws.id)
    ws.send('hey')
  })
  ws.send('ho!')
})

