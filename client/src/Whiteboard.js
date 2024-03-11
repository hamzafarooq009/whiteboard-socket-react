import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:3001');

function Whiteboard() {
    // A ref created with useRef to store a reference to the canvas DOM element. This allows direct manipulation of the canvas.
    const canvasRef = useRef(null);

    // Another ref to store the canvas's 2D rendering context, enabling drawing operations on the canvas.
    const contextRef = useRef(null);

    // isDrawing state is initialized with useState, tracking whether the user is currently drawing.
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = 800;
        canvas.height = 600;
        canvas.style.width = '100%';
        canvas.style.height = '100%';

        const context = canvas.getContext('2d');
        context.strokeStyle = 'black'; // Default line color
        context.lineWidth = 5; // Default line width
        contextRef.current = context;

        // Sets up a Socket.io event listener for 'drawing' events to receive draw data from other clients and replicate the drawing on this client's canvas.
        socket.on('drawing', (data) => {
            const { x0, y0, x1, y1 } = data;
            drawLine(context, x0, y0, x1, y1);
        });

            // Add this listener for the 'test' event
        socket.on('test', (data) => {
            console.log(data.message); // Should log "Hello from server"
        });
    }, []);

    // A utility function to draw a line on the canvas given start and end coordinates. It's used for both local drawing and replicating remote drawings received via Socket.io.
    const drawLine = (context, x0, y0, x1, y1) => {
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.stroke();
        context.closePath();
    };

    // Activated on onMouseDown, it initializes the drawing process by setting isDrawing to true and moves the canvas context's starting point to the mouse position.
    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        setIsDrawing(true);
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        console.log(`Start drawing at ${offsetX}, ${offsetY}`);
    };

    // draw: Triggered on onMouseMove, it checks if isDrawing is true and, if so, draws to the new mouse position and emits this drawing data to other clients via Socket.io.
    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
        console.log(`Drawing to ${offsetX}, ${offsetY}`);
        // Emit the drawing coordinates only when the mouse is moving while drawing
        socket.emit('drawing', { x0: offsetX, y0: offsetY, x1: offsetX, y1: offsetY });
    };

    // stopDrawing: Activated on onMouseUp or onMouseOut, it ends the drawing process by setting isDrawing to false.
    const stopDrawing = () => {
        setIsDrawing(false);
        contextRef.current.closePath();
        console.log('Stop drawing');
    };

    return (
        <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing} // Added to handle the case when the mouse leaves the canvas
            onMouseMove={draw}
            style={{ border: '1px solid black' }}
        />
    );
}

export default Whiteboard;