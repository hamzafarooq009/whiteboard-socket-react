import React, { useRef, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useParams } from "react-router-dom";

function Whiteboard() {
  const { id } = useParams();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(5);
  const [shareUsername, setShareUsername] = useState('');


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

  const drawLine = (x0, y0, x1, y1) => {
    const context = canvasRef.current.getContext("2d");
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
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

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    drawLine(offsetX, offsetY, offsetX, offsetY);
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