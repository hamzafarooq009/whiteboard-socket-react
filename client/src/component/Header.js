import React from 'react';
import { useAuth } from '../component/AuthContext';
import { AppBar, Toolbar, Typography, IconButton, Button } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function Header() {
  const { currentUser } = useAuth();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Whiteboard App
        </Typography>
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              color="inherit"
            >
              <AccountCircleIcon />
            </IconButton>
            <Typography variant="subtitle1" component="div">
              {currentUser.username}
            </Typography>
            {/* Add logout button or user menu if required */}
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;