const WebSocketServer = require('websocket').server;
const http = require('http');

function incomingSlackWebhook(request) {
  let data = "";
  request.on("data", (chunk) => {
    data += chunk;
  });
  request.on("end", () => {
    console.log("incoming slack message: " + data);
    incomingMessage(JSON.parse(data.text));
    request.removeAllListeners();
  });
}

function parseQueryString(queryString) {
  return queryString.split("&").map(it => it.split("=")).reduce((prev, [key, value]) => ({ ...prev, [key]: decodeURIComponent(value) }), {});
}

const server = http.createServer(function (request, response) {
  const [_, queryString] = request.url.split("?");
  response.end();
  if (request.method.toLowerCase() === "get") {
    const query = parseQueryString(queryString);
    console.log("incoming message: " + query.q);
    incomingMessage(query.q);
  } else if (request.method.toLowerCase() === "post") {
    incomingSlackWebhook(request);
  }
});
server.listen(process.env.PORT, function () {
  console.log(`${new Date()} Server is listening on port ${process.env.PORT}` );
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

function incomingMessage(message) {
  connections.forEach(it => it.sendUTF(message));
}
