// WhiteboardCard.js
import React from 'react';
import { Card, CardContent, Typography, Box, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

function WhiteboardCard({ whiteboard, handleMenuOpen, currentUser }) {
  return (
    <Card sx={{ minHeight: 140 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h5">{whiteboard.title}</Typography>
          <IconButton onClick={(e) => handleMenuOpen(e, whiteboard._id)} size="small">
            <MoreVertIcon />
          </IconButton>
        </Box>
        <Typography color="textSecondary">
          {whiteboard.owner?.username === currentUser?.username
            ? "Owned by you"
            : `Shared by ${whiteboard.owner?.username ?? "someone"}`}
        </Typography>
        <Typography color="textSecondary">
          Updated: {new Date(whiteboard.updatedAt).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default WhiteboardCard;