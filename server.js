const http = require('http-server');
const chokidar = require('chokidar');
const WebSocket = require('ws');

// Start HTTP server
const server = http.createServer({ root: '.' });
server.listen(8080, () => {
    console.log('HTTP server running on http://localhost:8080');
});

// Set up WebSocket server
const wss = new WebSocket.Server({ port: 8081 });
wss.on('connection', ws => {
    console.log('WebSocket connection established');
});

// Watch for file changes
chokidar.watch('.').on('change', (path) => {
    console.log(`File ${path} has been changed`);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send('reload');
        }
    });
});