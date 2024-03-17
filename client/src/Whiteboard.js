import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import { FaEraser } from "react-icons/fa";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import TextField from "@mui/material/TextField";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import { FaRegSquare, FaUpload } from "react-icons/fa";
import { ChromePicker } from "react-color";
import { BiPencil } from "react-icons/bi";
import { useParams } from "react-router-dom";

const socket = io.connect("http://localhost:3001"); // Connect to Socket.io server

function Whiteboard() {
  const { id } = useParams(); // Get the whiteboard ID from the URL

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pencil");
  const [pencilSize, setPencilSize] = useState(5);
  const [eraserSize, setEraserSize] = useState(5);
  const [textSize, setTextSize] = useState(20);
  const [text, setText] = useState("");
  const [showTextField, setShowTextField] = useState(false);
  const [textFieldPosition, setTextFieldPosition] = useState({ x: 0, y: 0 });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [color, setColor] = useState("#000000");
  const [image, setImage] = useState(null);
  const [imageUpload, setImageUpload] = useState(null); // State to handle the file input

  // Custom style for Toolbar
  const toolbarStyle = {
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #ccc",
    padding: "8px 16px",
    backgroundColor: "#f9f9f9",
  };

  // Color picker icon button style
  const colorPickerButtonStyle = {
    color: color,
    width: "40px",
    height: "40px",
    border: "2px solid",
    borderColor: showColorPicker ? "black" : "transparent",
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const context = canvas.getContext("2d");
    context.lineCap = "round";

    socket.on("drawing", (data) => {
      // Check if data is received
      console.log("Drawing data received:", data);

      if (data.tool === "text") {
        context.font = `${data.textSize}px Arial`;
        context.fillStyle = data.color;
        context.fillText(data.text, data.x, data.y);
      } else {
        drawLine(
          data.x0,
          data.y0,
          data.x1,
          data.y1,
          data.lineWidth,
          data.color,
          data.tool === "eraser"
        );
      }
    });

    // Listen for the 'image' event from the server
    socket.on("image", (data) => {
      const img = new Image();
      img.onload = () => context.drawImage(img, 0, 0);
      img.src = data;
    });

    return () => {
      socket.off("drawing"); // Clean up the event listener
      socket.off("image"); // Clean up the event listener
    };
  }, []);

  // Function to handle file upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      file.type.startsWith("image/") &&
      file.size <= 2 * 1024 * 1024
    ) {
      // File is an image and less than 2MB
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target.result); // Set image state to the data URL
      };
      reader.readAsDataURL(file);
    } else {
      // Handle errors
      alert("File must be an image and less than 2 MB.");
    }
  };

  const handleCanvasClick = (e) => {
    if (tool === "text") {
      const { offsetX, offsetY } = e.nativeEvent;
      setTextFieldPosition({ x: offsetX, y: offsetY });
      setShowTextField(true);
    }
  };

  const handleTextSubmit = (e) => {
    if (e.key === "Enter") {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Render text locally
      context.font = `${textSize}px Arial`;
      context.fillStyle = color;
      context.fillText(text, textFieldPosition.x, textFieldPosition.y);

      // Hide the text field
      setShowTextField(false);

      // Emit text drawing action to other clients
      socket.emit("drawing", {
        tool: "text",
        text,
        x: textFieldPosition.x,
        y: textFieldPosition.y,
        textSize,
        color,
      });

      // Clear the text field
      setText("");
    }
  };

  const startDrawing = ({ nativeEvent }) => {
    if (tool !== "pencil" && tool !== "eraser") return;
    const { offsetX, offsetY } = nativeEvent;
    setIsDrawing(true);
    const lineWidth = tool === "eraser" ? eraserSize : pencilSize;
    drawLine(
      offsetX,
      offsetY,
      offsetX,
      offsetY,
      lineWidth,
      color,
      tool === "eraser"
    );
    socket.emit("drawing", {
      tool,
      x0: offsetX,
      y0: offsetY,
      x1: offsetX,
      y1: offsetY,
      lineWidth,
      color,
    });
  };

  const drawLine = (x0, y0, x1, y1, lineWidth, color, isEraser) => {
    const context = canvasRef.current.getContext("2d");
    context.lineWidth = lineWidth;
    context.strokeStyle = color;
    context.globalCompositeOperation = isEraser
      ? "destination-out"
      : "source-over";
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
    context.closePath();
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const lineWidth = tool === "eraser" ? eraserSize : pencilSize;
    drawLine(
      offsetX,
      offsetY,
      offsetX,
      offsetY,
      lineWidth,
      color,
      tool === "eraser"
    );
    socket.emit("drawing", {
      tool,
      x0: offsetX,
      y0: offsetY,
      x1: offsetX,
      y1: offsetY,
      lineWidth,
      color,
    });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleColorChange = (color) => {
    setColor(color.hex);
  };

  // Function to handle file selection and immediately draw/upload the image
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (
      file &&
      (file.type === "image/png" ||
        file.type === "image/jpeg" ||
        file.type === "image/jpg") &&
      file.size <= 2097152
    ) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          setImage(img);
          // Emit the image data to the server
          socket.emit("image", e.target.result);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      alert("File must be an image (png, jpeg, jpg) and less than 2 MB.");
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Toolbar>
        <IconButton
          color={tool === "pencil" ? "primary" : "default"}
          onClick={() => setTool("pencil")}
        >
          <BiPencil />
        </IconButton>
        {tool === "pencil" && (
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
        <IconButton
          color={tool === "eraser" ? "primary" : "default"}
          onClick={() => setTool("eraser")}
        >
          <FaEraser />
        </IconButton>
        {tool === "eraser" && (
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
        <IconButton
          color={tool === "text" ? "primary" : "default"}
          onClick={() => setTool("text")}
        >
          <TextFieldsIcon />
        </IconButton>
        {tool === "text" && (
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
        <IconButton onClick={() => setShowColorPicker((show) => !show)}>
          <FaRegSquare style={{ color: color }} />
        </IconButton>
        {showColorPicker && (
          <ChromePicker color={color} onChange={handleColorChange} />
        )}

        <input
          accept="image/png, image/jpeg"
          type="file"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="raised-button-file"
        />
        <label htmlFor="raised-button-file">
          <IconButton component="span">
            <FaUpload />
          </IconButton>
        </label>
      </Toolbar>
      {showTextField && (
        <TextField
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleTextSubmit}
          style={{
            position: "absolute",
            left: textFieldPosition.x,
            top: textFieldPosition.y,
          }}
        />
      )}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        style={{
          border: "1px solid black",
          width: "100%",
          height: "calc(100vh - 64px)",
        }}
      />
    </Box>
  );
}

export default Whiteboard;
