// server.js
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

io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on('drawing', (data) => {
      io.emit('drawing', data);  // Emit to all clients, including the sender
    });
  
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });  

const port = 3001;
server.listen(port, () => console.log(`Listening on port ${port}`));