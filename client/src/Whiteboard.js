import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import { BiPencil } from 'react-icons/bi'; // Using react-icons for pencil
import { FaEraser } from 'react-icons/fa'; // Using react-icons for eraser
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';


const socket = io.connect('http://localhost:3001');  // Connect to Socket.io server

function Whiteboard() {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('pencil');
    const [lineWidth, setLineWidth] = useState(5);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    
        const context = canvas.getContext('2d');
        context.lineCap = 'round';
    
        const drawLine = (x0, y0, x1, y1, lineWidth, color, isEraser) => {
            context.lineWidth = lineWidth;
            context.strokeStyle = isEraser ? 'rgba(0,0,0,1)' : color;
            context.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
            context.beginPath();
            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.stroke();
            context.closePath();
        };
    
        // Handle new event to load drawing
        socket.on('loadDrawing', (drawingActions) => {
            drawingActions.forEach(action => {
                drawLine(action.x0, action.y0, action.x1, action.y1, action.lineWidth, action.color, action.isEraser);
            });
        });
    
        socket.on('drawing', (data) => {
            drawLine(data.x0, data.y0, data.x1, data.y1, data.lineWidth, data.color, data.isEraser);
        });
    
    }, []);
    

    const drawLine = (x0, y0, x1, y1, lineWidth, isEraser) => {
        const context = canvasRef.current.getContext('2d');
        context.lineWidth = lineWidth;
        context.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.stroke();
        context.closePath();
      };
      
      const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        setIsDrawing(true);
        const isEraser = tool === 'eraser';
        // Draw and emit
        drawLine(offsetX, offsetY, offsetX, offsetY, lineWidth, isEraser);
        socket.emit('drawing', { x0: offsetX, y0: offsetY, x1: offsetX, y1: offsetY, lineWidth, isEraser });
      };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        const isEraser = tool === 'eraser';
        // Draw and emit
        drawLine(offsetX, offsetY, offsetX, offsetY, lineWidth, isEraser);
        socket.emit('drawing', { x0: offsetX, y0: offsetY, x1: offsetX, y1: offsetY, lineWidth, isEraser });
      };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Toolbar>
                <IconButton color={tool === 'pencil' ? 'primary' : 'default'} onClick={() => setTool('pencil')}>
                    <BiPencil />
                </IconButton>
                <Slider
                    size="small"
                    value={lineWidth}
                    onChange={(e) => setLineWidth(e.target.value)}
                    aria-label="Pencil Width"
                    valueLabelDisplay="auto"
                    min={1}
                    max={50}
                    sx={{ width: 200, mx: 2 }}
                />
                <IconButton color={tool === 'eraser' ? 'primary' : 'default'} onClick={() => setTool('eraser')}>
                    <FaEraser />
                </IconButton>
            </Toolbar>
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={draw}
                style={{ border: '1px solid black', width: '100%', height: 'calc(100vh - 64px)' }}
            />
        </Box>
    );
}
export default Whiteboard;