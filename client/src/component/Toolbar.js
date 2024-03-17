import React from 'react';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import { BiPencil } from 'react-icons/bi';
import { FaEraser } from 'react-icons/fa';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import Toolbar from '@mui/material/Toolbar';

function DrawingToolbar({ tool, setTool, lineWidth, setLineWidth }) {
  return (
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
      <IconButton color={tool === 'text' ? 'primary' : 'default'} onClick={() => setTool('text')}>
        <TextFieldsIcon />
      </IconButton>
    </Toolbar>
  );
}

export default DrawingToolbar;