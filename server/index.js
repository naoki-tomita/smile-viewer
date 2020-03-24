const WebSocketServer = require('websocket').server;
const http = require('http');

function parseQueryString(queryString) {
  return queryString
    .split("&").map(it => it.split("="))
    .reduce((prev, [key, value]) => ({ ...prev, [key]: decodeURIComponent(value) }), {});
}

async function parseBody(request) {
  return new Promise(ok => {
    let data = "";
    request.on("data", (chunk) => data += chunk);
    request.on("end", () => (ok(JSON.parse(data)), request.removeAllListeners()));
  });
}

const server = http.createServer(async (request, response) => {
  try {
    if (request.method.toLowerCase() === "get") {
      const [_, queryString] = request.url.split("?");
      const query = parseQueryString(queryString);
      console.log("incoming message: " + query.q);
      incomingMessage(query.q);
    } else if (request.method.toLowerCase() === "post") {
      const body = await parseBody(request);
      if (body.type === "url_verification") {
        response.statusCode = 200;
        response.setHeader("content-type", "application/json");
        response.end(JSON.stringify({ challenge: body.challenge }));
        return;
      }
      if (body.event.type === "message") {
        console.log("incoming slack message: " + body.event.text);
        incomingMessage(body.event.text);
      }
    }
  } finally {
    !response.writableEnded && response.end();
  }
});

server.listen(process.env.PORT);
wsServer = new WebSocketServer({ httpServer: server, autoAcceptConnections: false });
const connections = [];
wsServer.on('request', function (request) {
  const connection = request.accept();
  connections.push(connection);
  connection.on('close', () => {
    connections.splice(connections.findIndex(con => connection.remoteAddress === con.remoteAddress), 1);
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    console.log(`Connections: ${connections.length}`);
  });
});

function incomingMessage(message) {
  connections.forEach(it => it.sendUTF(message));
}
