'use strict';

const http = require('http');
const WebSocket = require('ws');
const url = require('url');
const PORT = process.env.PORT || 3001;

const server = http.createServer(function (request, response) {
    // Send the HTTP header 
    // HTTP Status: 200 : OK
    // Content Type: text/plain
    response.writeHead(200, { 'Content-Type': 'text/plain' });

    // Send the response body as "Hello World"
    response.end('Hello World\n');
})

//88 web sockets; 
var keys = new Array(88).fill(() => new WebSocket.Server({ noServer: true }));

keys = keys.map((newSocket) => newSocket());

keys.forEach((socket, idx) => {
    socket.on('connection', function connection(ws) {
        //set up the ping
        var id = setInterval(function () {
            ws.send(null, function () { })
        }, 1000);
        // ...
        console.log("connected", idx);
        ws.on('message', function incoming(message) {
            console.log(`received message: ${message} on PORT: ${PORT}`);
            socket.clients.forEach(function each(client) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });

        });

        // clear the ping when the socket closes
        ws.on('close', function close() {
            clearInterval(id);
        });
    });
});

// The initializers 
var upgradeHandler = {};
for (let i = 0; i<88; i++) {
    upgradeHandler[`/${i}`] = (request, socket, head) => {
        console.log(i);
        keys[i].handleUpgrade(request, socket, head, function done(ws) {
            keys[i].emit('connection', ws, request);
            //wow that shit actually worked.
            console.log(i);
        });
    }
}

server.on('upgrade', function upgrade(request, socket, head) {
    const pathname = url.parse(request.url).pathname;
        if (!upgradeHandler[pathname]) {
            socket.destroy();
        } else {
            upgradeHandler[pathname](request, socket, head);
        }
});

server.listen(PORT);