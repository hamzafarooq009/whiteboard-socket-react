import React, { useRef, useEffect } from 'react';

function Canvas({ tool, lineWidth, color, handleCanvasClick, startDrawing, stopDrawing, draw }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      onMouseDown={startDrawing}
      onMouseUp={stopDrawing}
      onMouseMove={draw}
      style={{ border: '1px solid black', width: '100%', height: 'calc(100vh - 64px)' }}
    />
  );
}

export default Canvas;