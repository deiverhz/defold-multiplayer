const { WebSocketServer } = require('ws');

// Create a WebSocket server instance listening on port 3000
const wss = new WebSocketServer({ port: 3000 });

// Event listener for when a new client connects
wss.on('connection', function connection(ws) {
  console.log('A new client connected!');

  // Event listener for messages received from this client
  ws.on('message', function message(data) {
    console.log('Received message from client: %s', data);

    // Echo the received message back to the client
    ws.send(`Server received: ${data}`);
  });

  // Event listener for when the client closes the connection
  ws.on('close', () => {
    console.log('Client disconnected.');
  });

  // Event listener for errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  // Send a welcome message to the newly connected client
  ws.send('Welcome to the WebSocket server!');
});

console.log('WebSocket server started on port 3000');
