const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  }
});

let drawingActions = []; // Store drawing actions

io.on('connection', (socket) => {
  console.log('New client connected');

  // Send the current drawing state to the new client
  socket.emit('loadDrawing', drawingActions);

  socket.on('drawing', (data) => {
    drawingActions.push(data); // Store new drawing action
    socket.broadcast.emit('drawing', data); // Emit to all clients except the sender
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const port = process.env.PORT || 3001;
server.listen(port, () => console.log(`Listening on port ${port}`));