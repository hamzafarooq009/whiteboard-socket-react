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
    // Handle different drawing actions based on a type property
    if (data.tool === 'text') {
      // This is a text drawing action
      console.log('Received text drawing action');
    } else {
      // This is a line drawing action
      console.log('Received line drawing action');
    }

    drawingActions.push(data); // Store new drawing action
    
    // Emit to all clients, including the sender
    io.emit('drawing', data); // Replace `socket.broadcast.emit` with `io.emit`
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const port = process.env.PORT || 3001;
server.listen(port, () => console.log(`Listening on port ${port}`));