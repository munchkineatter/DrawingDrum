const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let players = [];

wss.on('connection', (ws) => {
    // Send the current list of players to the new connection
    ws.send(JSON.stringify(players));

    ws.on('message', (message) => {
        const player = JSON.parse(message);
        players.push(player);

        // Broadcast the updated list to all connected clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(players));
            }
        });
    });
});

console.log('WebSocket server is running on ws://localhost:8080'); 