const WebSocket = require('ws')

const wss = new WebSocket.Server({ port: 8082 })

wss.on('connection', (ws, req) => {
  ws.on('message', message => {
    console.log(`Received message => ${message}`)
    console.log(req)
  })
  ws.send('ho!')
})

