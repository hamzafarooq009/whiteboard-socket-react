import React, { useState } from 'react';
import { useAuth } from '../component/AuthContext';
import { AppBar, Toolbar, Typography, IconButton, Button, Menu, MenuItem } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';


function Header() {
  const navigate = useNavigate();
  const { currentUser, setIsLoggedIn } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Call the logout API
    fetch('http://localhost:3000/logout', {
      method: 'GET',
      credentials: 'include', // Necessary for sessions/cookies to work
    })
    .then(response => {
      if (response.ok) {
        setIsLoggedIn(false); // If you're using a state to manage login
        handleClose(); // Close the dropdown menu
        // Redirect to the login page or home page after logout
        navigate('/login');
      } else {
        console.error('Logout failed');
      }
    })
    .catch((error) => {
      console.error('Error during logout', error);
    });
  };
  

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
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircleIcon />
            </IconButton>
            <Typography variant="subtitle1" component="div" sx={{ mr: 2 }}>
              {currentUser.username}
            </Typography>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={open}
              onClose={handleClose}
            >
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;