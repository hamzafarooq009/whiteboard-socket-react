const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

// Configure CORS
const io = socketIo(server, {
    cors: {
      origin: true,
      methods: ["GET", "POST"],
      credentials: true,
    }
  });
  

  io.on('connection', (socket) => {
    console.log('New client connected');
    
    // Getting the port from the client's socket
    const clientPort = socket.request.connection.remotePort;
    console.log(`Client connected on port: ${clientPort}`);

    socket.broadcast.emit('test', { message: 'Hello from server' });
  
    socket.on('drawing', (data) => {
      socket.broadcast.emit('drawing', data);
    // io.emit('drawing', data);
    });
  
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
  

const port = 3001;
server.listen(port, () => console.log(`Listening on port ${port}`));