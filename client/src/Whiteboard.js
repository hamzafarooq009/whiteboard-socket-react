import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import { BiPencil } from 'react-icons/bi'; // Using react-icons for pencil
import { FaEraser } from 'react-icons/fa'; // Using react-icons for eraser
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField'; // For inline text input
import TextFieldsIcon from '@mui/icons-material/TextFields';
import { ChromePicker } from 'react-color';
import { FaRegSquare } from 'react-icons/fa'; // Icon for color picker


const socket = io.connect('http://localhost:3001');  // Connect to Socket.io server

function Whiteboard() {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('pencil');
    const [pencilSize, setPencilSize] = useState(5);
    const [eraserSize, setEraserSize] = useState(5);
    const [textSize, setTextSize] = useState(20);
    const [text, setText] = useState('');
    const [showTextField, setShowTextField] = useState(false);
    const [textFieldPosition, setTextFieldPosition] = useState({ x: 0, y: 0 });
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [color, setColor] = useState('#000000');

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const context = canvas.getContext('2d');
        context.lineCap = 'round';
      
        socket.on('drawing', (data) => {
          // Check if data is received
          console.log('Drawing data received:', data);
      
          if (data.tool === 'text') {
            context.font = `${data.textSize}px Arial`;
            context.fillStyle = data.color;
            context.fillText(data.text, data.x, data.y);
          } else {
            drawLine(data.x0, data.y0, data.x1, data.y1, data.lineWidth, data.color, data.tool === 'eraser');
          }
        });
      
        return () => {
          socket.off('drawing'); // Clean up the event listener
        };
      }, []);
      

    const handleCanvasClick = (e) => {
        if (tool === 'text') {
            const { offsetX, offsetY } = e.nativeEvent;
            setTextFieldPosition({ x: offsetX, y: offsetY });
            setShowTextField(true);
        }
    };

    const handleTextSubmit = (e) => {
        if (e.key === 'Enter') {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
    
            // Render text locally
            context.font = `${textSize}px Arial`;
            context.fillStyle = color;
            context.fillText(text, textFieldPosition.x, textFieldPosition.y);
    
            // Hide the text field
            setShowTextField(false);
    
            // Emit text drawing action to other clients
            socket.emit('drawing', {
                tool: 'text',
                text,
                x: textFieldPosition.x,
                y: textFieldPosition.y,
                textSize,
                color
            });
    
            // Clear the text field
            setText('');
        }
    };    

    const startDrawing = ({ nativeEvent }) => {
        if (tool !== 'pencil' && tool !== 'eraser') return;
        const { offsetX, offsetY } = nativeEvent;
        setIsDrawing(true);
        const lineWidth = tool === 'eraser' ? eraserSize : pencilSize;
        drawLine(offsetX, offsetY, offsetX, offsetY, lineWidth, color, tool === 'eraser');
        socket.emit('drawing', { tool, x0: offsetX, y0: offsetY, x1: offsetX, y1: offsetY, lineWidth, color });
    };

    const drawLine = (x0, y0, x1, y1, lineWidth, color, isEraser) => {
        const context = canvasRef.current.getContext('2d');
        context.lineWidth = lineWidth;
        context.strokeStyle = color;
        context.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.stroke();
        context.closePath();
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        const lineWidth = tool === 'eraser' ? eraserSize : pencilSize;
        drawLine(offsetX, offsetY, offsetX, offsetY, lineWidth, color, tool === 'eraser');
        socket.emit('drawing', { tool, x0: offsetX, y0: offsetY, x1: offsetX, y1: offsetY, lineWidth, color });
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };
    
    const handleColorChange = (color) => {
        setColor(color.hex);
    };
    
    return (
        <Box sx={{ flexGrow: 1 }}>
            <Toolbar>
                <IconButton color={tool === 'pencil' ? 'primary' : 'default'} onClick={() => setTool('pencil')}>
                    <BiPencil />
                </IconButton>
                {tool === 'pencil' && (
                    <Slider
                        size="small"
                        value={pencilSize}
                        onChange={(e) => setPencilSize(e.target.value)}
                        aria-label="Pencil Width"
                        valueLabelDisplay="auto"
                        min={1}
                        max={50}
                        sx={{ width: 200, mx: 2 }}
                    />
                )}
                <IconButton color={tool === 'eraser' ? 'primary' : 'default'} onClick={() => setTool('eraser')}>
                    <FaEraser />
                </IconButton>
                {tool === 'eraser' && (
                    <Slider
                        size="small"
                        value={eraserSize}
                        onChange={(e) => setEraserSize(e.target.value)}
                        aria-label="Eraser Size"
                        valueLabelDisplay="auto"
                        min={1}
                        max={50}
                        sx={{ width: 200, mx: 2 }}
                    />
                )}
                <IconButton color={tool === 'text' ? 'primary' : 'default'} onClick={() => setTool('text')}>
                    <TextFieldsIcon />
                </IconButton>
                {tool === 'text' && (
                    <Slider
                        size="small"
                        value={textSize}
                        onChange={(e) => setTextSize(e.target.value)}
                        aria-label="Text Size"
                        valueLabelDisplay="auto"
                        min={10}
                        max={100}
                        sx={{ width: 200, mx: 2 }}
                    />
                )}
                <IconButton onClick={() => setShowColorPicker(show => !show)}>
                    <FaRegSquare style={{ color: color }} />
                </IconButton>
                {showColorPicker && (
                    <ChromePicker
                        color={color}
                        onChange={handleColorChange}
                    />
                )}
            </Toolbar>
            {showTextField && (
                <TextField
                    autoFocus
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={handleTextSubmit}
                    style={{ position: 'absolute', left: textFieldPosition.x, top: textFieldPosition.y }}
                />
            )}
            <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={draw}
                style={{ border: '1px solid black', width: '100%', height: 'calc(100vh - 64px)' }}
            />
        </Box>
    );
}

export default Whiteboard;