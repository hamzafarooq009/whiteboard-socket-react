import React, { useRef, useEffect, useState } from 'react';

function Whiteboard() {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('pencil');
    const [pencilWidth, setPencilWidth] = useState(5);
    const [eraserWidth, setEraserWidth] = useState(10);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }, []);

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        const context = canvasRef.current.getContext('2d');

        context.lineWidth = tool === 'eraser' ? eraserWidth : pencilWidth;

        if (tool === 'eraser') {
            context.globalCompositeOperation = 'destination-out';
        } else {
            context.globalCompositeOperation = 'source-over';
            context.strokeStyle = 'black';
        }

        context.beginPath();
        context.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) {
            return;
        }
        const { offsetX, offsetY } = nativeEvent;
        const context = canvasRef.current.getContext('2d');
        context.lineTo(offsetX, offsetY);
        context.stroke();
    };

    const stopDrawing = () => {
        const context = canvasRef.current.getContext('2d');
        context.closePath();
        setIsDrawing(false);
    };

    return (
        <div>
            <button onClick={() => setTool('pencil')}>Pencil</button>
            <input type="range" min="1" max="50" value={pencilWidth} onChange={(e) => setPencilWidth(e.target.value)} />
            <button onClick={() => setTool('eraser')}>Eraser</button>
            <input type="range" min="1" max="50" value={eraserWidth} onChange={(e) => setEraserWidth(e.target.value)} />
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