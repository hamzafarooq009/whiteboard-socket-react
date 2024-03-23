import React from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';

function CreateWhiteboardModal({ open, onClose, createWhiteboard, newWhiteboardTitle, setNewWhiteboardTitle }) {
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2">
          Create a new whiteboard
        </Typography>
        <TextField
          fullWidth
          margin="normal"
          label="Whiteboard Title"
          value={newWhiteboardTitle}
          onChange={(e) => setNewWhiteboardTitle(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={createWhiteboard}
        >
          Create
        </Button>
      </Box>
    </Modal>
  );
}

export default CreateWhiteboardModal;