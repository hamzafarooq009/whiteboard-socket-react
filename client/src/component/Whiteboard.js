import React, { useRef, useEffect, useState, useContext } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client"
import { useAuth } from "../component/AuthContext"; // Import AuthContext


// const socket = io.connect("http://localhost:3000"); // Connect to Socket.io server

function Whiteboard() {
  const { id } = useParams();
  const { currentUser } = useAuth(); // Use currentUser from AuthContext
  const [socket, setSocket] = useState(null);

  
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(5);
  const [shareUsername, setShareUsername] = useState('');

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

    newSocket.on('draw', drawFromSocket);

    return () => {
      newSocket.off('draw', drawFromSocket);
      newSocket.close();
    };
  }, [id, currentUser]);
  


  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const context = canvas.getContext("2d");
    context.lineCap = "round";

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

  return (
    <Box>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        style={{ border: "1px solid black" }}
      />
      <TextField
        label="Username"
        variant="outlined"
        value={shareUsername}
        onChange={(e) => setShareUsername(e.target.value)}
      />
      <Button onClick={shareWhiteboard}>Share</Button>
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