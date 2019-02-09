process.title = 'hodler-api'
const util = require('util')

// Port where we'll run the websocket server
var webSocketsServerPort = 1337

// websocket and http servers
var webSocketServer = require('websocket').server
var http = require('http')
var uuid = require('uuid')

/**
 * Global variables
 */
var addresses = []
var clientData = []

// list of currently connected clients (users)
var clients = []

/**
 * HTTP server
 */
var server = http.createServer(function(request, response) {});
server.listen(webSocketsServerPort, function() {
  console.log((new Date()) + " Server is listening on port "
      + webSocketsServerPort);
});


// WebSocket server
var wsServer = new webSocketServer({
  httpServer: server
});
 
wsServer.on('request', function(request) {
  console.log((new Date()) + ' Connection from origin '
      + request.origin + '.')
  var connection = request.accept(null, request.origin); 
  
  // we need to know client index to remove them on 'close' event
  connection.uuid = uuid.v4();
  var index = clients.push(connection) - 1;
  
  console.log((new Date()) + ' Connection accepted.');

  //Client sends addresses to watch
  connection.on('message', function(message) {
    console.log((new Date()) + " client_uuid : "+clients[index].uuid)
    console.log((new Date()) + " Index : " + index)
    console.log((new Date()) + " Addresses : " + util.inspect(message, false, null, true))
    var found = clientData.some(function (e) {
      return e.uuid == connection.uuid;
    });
    if(!found){
      var chunk = {'uuid' : clients[index].uuid, 'addresses' : message.utf8Data}
      clientData.push(chunk)   
    }
    else {
      var elementPos = clientData.map(function (x) {
          return x.uuid;
      }).indexOf(connection.uuid);
      clientData[elementPos].addresses = message.utf8Data;
    }
    clientData.forEach(function (element) {
      var temp = element.addresses.split(',');
      temp.forEach(function (e) {
          addresses.push(e);
      });
  });

  // user disconnected
  connection.on('close', function(connection) {  
      console.log((new Date()) + " Peer "
          + index + " disconnected.");
      // remove user from the list of connected clients
      clients.splice(index, 1)
      

      console.log((new Date()) + " Connected clients : " + clients.length)
    });
  });
});