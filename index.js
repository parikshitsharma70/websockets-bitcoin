process.title = 'hodler-api'
const util = require('util')
var io_client = require('socket.io-client');
var socket_client = io_client.connect('http://3.17.104.7:3001')
var eventToListenTo = 'tx';
var room = 'inv';


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
  
  connection.uuid = uuid.v4();
  console.log((new Date()) + ' Connection accepted.');

  connection.on('message', function(message) {
    console.log((new Date()) + " client_uuid : "+ connection.uuid)
    console.log((new Date()) + " Addresses : " + util.inspect(message, false, null, true))
    var found = clientData.some(function (e) {
      return e.uuid == connection.uuid;
    });
    if(!found){
      var chunk = {'uuid' : connection.uuid, 'addresses' : message.utf8Data}
      clientData.push(chunk)
      var t = message.utf8Data.split(',');
      t.forEach(function (el){
      addresses.push(el)
      })   
    }
    else {
      var elementPos = clientData.map(function (x) {
        return x.uuid;
      }).indexOf(connection.uuid);
      if(clientData[elementPos].addresses != undefined || NULL){
        var addresses_to_delete = clientData[elementPos].addresses;
        for(var i = 0; i < addresses_to_delete.length; i++){
            var y = addresses.indexOf(addresses_to_delete[i]);
            addresses.splice(y, 1);
        }
      }
      var temp = message.utf8Data.split(',');
      temp.forEach(function (e) {
        addresses.push(e);
      });
    }
    console.log(addresses);
  });
  // user disconnected
  connection.on('close', function() {  
      console.log((new Date()) + " Peer "
          + connection.uuid + " disconnected.");
      var elPos = clients.map(function (x) {
        return x.uuid;
      }).indexOf(uuid);
      clients.splice(elPos, 1)
      console.log(addresses)
      console.log( 'connection : ' + connection)

      if (clientData != undefined){
        var elementPos = clientData.map(function (x) {
            return x.uuid;
        }).indexOf(connection.uuid);
        if(clientData != undefined && clientData[elementPos].addresses != undefined){
            var addresses_to_delete = clientData[elementPos].addresses;
            var del = addresses_to_delete.split(',')
            console.log('delete : ' + del )
            for(var i = 0; i < del.length; i++){
                var index = addresses.indexOf(del[i]);
                addresses.splice(index, 1);
            }
        }
        clientData.splice(elementPos, 1);
        }      
      console.log((new Date()) + " Connected clients : " + clients.length)
      console.log((new Date()) + " Client Data : " + util.inspect(clientData, false, null, true))
      console.log((new Date()) + " Addresses : " + addresses)
    });
  
});

socket_client.on('connect', function () {
  console.log('### socket_client connected to Insight tx room!');
  socket_client.emit('subscribe', room);
});

socket_client.on(eventToListenTo, function (data) {
  console.log(util.inspect(data, { showHidden: false, depth: null }));
  checkAndStream(data);
});

function checkAndStream(data) {
  var vout = data.vout;
  var result = [];
  console.log('### checkAndStream Addresses : ' + addresses);
  for (vouts in vout) {
      for (address in addresses) {
          if (addresses[address] == Object.keys(vout[vouts])) {
              result.push({ address: addresses[address], response: data });
          }
      }
  }
  console.log('### checkAndStream Result : ' + result);
  var uuid;
  console.log('### checkAndStream clientData : ' + util.inspect(clientData, { showHidden: false, depth: null }));
  clientData.forEach(function (el) {
      var temp = el.addresses.split(',');
      for (var j = 0; j < temp.length; j++) {
          for (var i = 0; i < result.length; i++) {
              if (temp[j] == result[i].address) {
                  var x = { uuid: el.uuid, address: temp[j] };
                  uuid = el.uuid;
              }
          }
      }
      var elementPos = clients.map(function (x) {
        return x.uuid;
      }).indexOf(uuid);
      clients[elementPos].send('tx', data);
  });
};
