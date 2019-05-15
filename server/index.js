var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function (request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});
server.listen(80, function () {
  console.log((new Date()) + ' Server is listening on port 80');
});

wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

function originIsAllowed(origin) {
  return true;
}

const connections = [];
wsServer.on('request', function (request) {
  if (!originIsAllowed(request.origin)) {
    request.reject();
    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
    return;
  }

  const connection = request.accept();
  connections.push(connection);
  console.log((new Date()) + ' Connection accepted.');
  connection.on('message', function (message) {
    connections.forEach(connection => {
      if (message.type === 'utf8') {
        console.log('Received Message: ' + message.utf8Data);
        connection.sendUTF(message.utf8Data);
      } else if (message.type === 'binary') {
        console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        connection.sendBytes(message.binaryData);
      }
    });
  });
  connection.on('close', function (reasonCode, description) {
    connections.splice(connections.findIndex(con => connection.remoteAddress === con.remoteAddress), 1);
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    console.log(`Connections: ${connections.length}`);
  });
});
