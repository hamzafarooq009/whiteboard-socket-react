import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { LuPencil } from "react-icons/lu";
import { FaEraser } from "react-icons/fa";

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

        const drawLine = (x0, y0, x1, y1, lineWidth, isEraser) => {
            context.lineWidth = lineWidth;
            context.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
            context.beginPath();
            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.stroke();
            context.closePath();
        };

        socket.on('drawing', (data) => {
            drawLine(data.x0, data.y0, data.x1, data.y1, data.lineWidth, data.isEraser);
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
        <div>
            <button onClick={() => { setTool('pencil'); canvasRef.current.style.cursor = 'crosshair'; }}><LuPencil /></button>
            <input type="range" min="1" max="50" value={lineWidth} onChange={(e) => setLineWidth(e.target.value)} />
            <button onClick={() => { setTool('eraser'); canvasRef.current.style.cursor = 'cell'; }}><FaEraser /></button>
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={draw}
                style={{ border: '1px solid black' }}
            />
        </div>
    );
}

export default Whiteboard;