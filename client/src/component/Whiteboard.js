import React, { useRef, useEffect, useState } from 'react';

import Tooltip from '@mui/material/Tooltip';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../component/AuthContext';

import { Box, Button, TextField, IconButton, Popover, Typography, Toolbar } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';

// const socket = io.connect("http://localhost:3000"); // Connect to Socket.io server

function Whiteboard() {
  const { id } = useParams();
  const { currentUser } = useAuth(); // Use currentUser from AuthContext
  const [socket, setSocket] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null); // For popover control


  
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(5);
  const [shareUsername, setShareUsername] = useState('');
  const [userCursors, setUserCursors] = useState({});


  useEffect(() => {
    // Avoid setting up the socket if currentUser is not valid
    if (!currentUser) return;
    
    const newSocket = io('http://localhost:3000', { withCredentials: true });
    setSocket(newSocket);
    newSocket.emit('join whiteboard', { whiteboardId: id, userId: currentUser.id });

    const drawFromSocket = (data) => {
      if (!canvasRef.current) return;
      const context = canvasRef.current.getContext('2d');
      if (data.userId !== currentUser.id) {
        context.beginPath();
        context.strokeStyle = data.color;
        // context.lineWidth = data.lineWidth;
        context.lineWidth = "20";
        context.moveTo(data.x0, data.y0);
        context.lineTo(data.x1, data.y1);
        context.stroke();
        context.closePath();
      }
    };

    const handleRemoteCursorMove = (cursorData) => {
      // Update the state to trigger a re-render
      // This can be an object with userId as keys and cursor positions as values
      // For example: { 'user1': {x: 10, y: 20}, 'user2': {x: 30, y: 40}, ... }
      setUserCursors((prevCursors) => ({
        ...prevCursors,
        [cursorData.userId]: cursorData.position,
      }));
    };

    newSocket.on('draw', drawFromSocket);
    newSocket.on('cursor move', handleRemoteCursorMove)


    return () => {
      newSocket.off('draw', drawFromSocket);
      newSocket.off('remote cursor move', handleRemoteCursorMove);
      newSocket.close();
    };
  }, [id, currentUser]);
  


  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const context = canvas.getContext("2d");
    context.lineCap = "round";

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw all cursors
    Object.entries(userCursors).forEach(([userId, position]) => {
      if (userId !== currentUser.id) { // Don't draw the current user's cursor
        context.fillStyle = 'red'; // Use a unique color for each user if desired
        context.beginPath();
        context.arc(position.x, position.y, 10, 0, Math.PI * 2);
        context.fill();
      }
    });

    // Load the saved state
    fetchSavedCanvasState(id).then((savedState) => {
      if (savedState) {
        const img = new Image();
        img.onload = () => context.drawImage(img, 0, 0);
        img.src = savedState;
      }
    });
  }, [id]);

  const shareWhiteboard = () => {
    // Call API to share the whiteboard with the specified username
    fetch(`http://localhost:3000/whiteboards/${id}/share`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: shareUsername }),
      credentials: 'include',
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error sharing the whiteboard');
      }
      alert('Whiteboard shared successfully');
    })
    .catch(error => {
      console.error('Error sharing the whiteboard:', error);
      alert('Error sharing the whiteboard');
    });
  };

  const drawLine = (x0, y0, x1, y1, lineColor, lineWidth) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;
  
    context.beginPath();
    context.strokeStyle = lineColor;
    context.lineWidth = "20";
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
    context.closePath();
  };  

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    setIsDrawing(true);
    drawLine(offsetX, offsetY, offsetX, offsetY); // Draw a dot
  };

  // Draw function now emits data to the server as well
  const draw = ({ nativeEvent }) => {
    if (!isDrawing || socket == null) return; // Check if socket is null
    const { offsetX, offsetY } = nativeEvent;
    const data = { x0: offsetX, y0: offsetY, x1: offsetX, y1: offsetY, color, lineWidth, userId: currentUser.id, whiteboardId: id };
    drawLine(offsetX, offsetY, offsetX, offsetY);

    console.log('Emitting draw event', data);
    socket.emit('draw', data);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    saveCanvasState(); // Save state when user stops drawing
  };

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    const canvasData = canvas.toDataURL();
    fetch(`http://localhost:3000/whiteboards/${id}/saveState`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ canvasData }),
      credentials: 'include',
    });
  };

  const handleMouseMove = (event) => {
    draw(event);

    if (socket) {
      socket.emit('cursor move', {
        whiteboardId: id,
        userId: currentUser.id,
        x: event.nativeEvent.offsetX,
        y: event.nativeEvent.offsetY,
      });
    }
  };


      // Function to handle click on share button
  const handleShareClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Function to close the popover
  const handleShareClose = () => {
    setAnchorEl(null);
  };
 
  const isPopoverOpen = Boolean(anchorEl); // Renamed for clarity
  const popoverId = isPopoverOpen ? 'share-popover' : undefined;

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Mini toolbar for sharing options */}
      <Toolbar
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '0 0 0 10px', // Round only the bottom-left corner
          p: '10px', // Padding inside the toolbar
        }}
      >
        <IconButton onClick={handleShareClick}>
          <ShareIcon />
        </IconButton>
        <Popover
          id={popoverId} // Use the new variable name here
          open={isPopoverOpen} // And here
          anchorEl={anchorEl}
          onClose={handleShareClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Box p={2}>
            <Typography variant="body1" gutterBottom>Share this whiteboard</Typography>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={shareUsername}
              onChange={(e) => setShareUsername(e.target.value)}
              size="small"
              margin="dense"
            />
            <Button 
              variant="contained" 
              color="primary" 
              onClick={shareWhiteboard}
              sx={{ mt: 1 }}
            >
              Share
            </Button>
          </Box>
        </Popover>
      </Toolbar>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        // onMouseMove={draw}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrawing}
        style={{ border: "1px solid black" }}
      />
    </Box>
  );
}

export default Whiteboard;

async function fetchSavedCanvasState(id) {
  const response = await fetch(`http://localhost:3000/whiteboards/${id}/getState`, { credentials: 'include' });
  if (response.ok) {
    const { canvasData } = await response.json();
    return canvasData;
  }
  return null;
}