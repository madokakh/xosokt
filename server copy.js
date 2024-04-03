const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

// Serve the lottery results
app.get('/results', (req, res) => {
  fs.readFile(path.join(__dirname, 'results.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading results.json:', err);
      return res.status(500).send('An error occurred');
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

// Notify clients when there's a new connection that they should fetch the latest results
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});

// Function to emit an update to clients when new results are available
// This function needs to be triggered after the scraper updates results.json
function notifyClientsOfNewResults() {
  io.emit('update'); // Notify all connected clients
  console.log('Notified clients of new results.');
}

// Watch for changes to results.json and notify clients
fs.watch(path.join(__dirname, 'results.json'), (eventType, filename) => {
  if (eventType === 'change') {
    console.log('results.json has been updated. Emitting update to clients.');
    notifyClientsOfNewResults();
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
