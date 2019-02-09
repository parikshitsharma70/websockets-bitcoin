var io_client = require('socket.io-client');

var socket_client = io_client.connect('http://3.17.104.7:3001')
var eventToListenTo = 'tx';
var room = 'inv';


socket_client.on('connect', function () {
    console.log('### socket_client connected to Insight tx room!');
    socket_client.emit('subscribe', room);
  });
  
  socket_client.on(eventToListenTo, function (data) {
    console.log(util.inspect(data, { showHidden: false, depth: null }));
    // checkAndStream(data);
  });


//const WebSocket = require('ws')
// var uuid = require('uuid')

// var WebSocketServer = WebSocket.Server,
//     wss = new WebSocketServer({port: 8082}),
//     CLIENTS=[];
// wss.on('connection', (ws, req) => {
//   // CLIENTS.push(ws)
//   ws.id = uuid.v4();
//   console.log(ws.id)
//   ws.on('message', message => {
//     console.log(`Received message => ${message}`)
//     console.log(ws.id)
//     ws.send('hey')
//   })
//   ws.send('ho!')
// })

