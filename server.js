const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// Keep shared state in memory (in a real app, you might use a database)
let playersList = [];
let currentHeader = null;
let currentTimer = 0;
let currentFontSize = 16;

// Helper function to broadcast a message to all clients
function broadcast(messageObj) {
    const messageStr = JSON.stringify(messageObj);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
        }
    });
}

wss.on('connection', (ws) => {
    // When a new client connects, send them the current state
    ws.send(JSON.stringify({ type: 'players', payload: playersList }));
    if (currentHeader) {
        ws.send(JSON.stringify({ type: 'header', payload: currentHeader }));
    }
    if (currentTimer > 0) {
        ws.send(JSON.stringify({ type: 'timer', payload: currentTimer }));
    }
    ws.send(JSON.stringify({ type: 'fontSize', payload: currentFontSize }));

    ws.on('message', (msg) => {
        const data = JSON.parse(msg);

        switch (data.type) {
            case 'players':
                // Replace the entire list of players with the new one
                playersList = data.payload;
                broadcast({ type: 'players', payload: playersList });
                break;
            
            case 'header':
                // Store the uploaded header image (base64) and broadcast
                currentHeader = data.payload;
                broadcast({ type: 'header', payload: currentHeader });
                break;
            
            case 'timer':
                // Store the timer value (in seconds) and broadcast
                currentTimer = data.payload;
                broadcast({ type: 'timer', payload: currentTimer });
                break;
            
            case 'fontSize':
                currentFontSize = data.payload;
                broadcast({ type: 'fontSize', payload: currentFontSize });
                break;
            
            default:
                console.log('Unknown message type:', data);
        }
    });
});

console.log('WebSocket server is running on ws://localhost:8080'); 