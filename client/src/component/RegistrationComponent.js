import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Card, CardContent, Typography, Alert, Box } from '@mui/material';
// import YourVectorGraphic from './header-right-600.png'; // Update with your actual file path


function RegistrationComponent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      navigate('/login'); // Redirect to login after successful registration
    } else {
      const errorText = await response.text();
      setErrorMessage(errorText || 'Registration failed. Please try again.');
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      height: '100vh',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f8f8f2',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: '50%',
        bottom: 0,
        backgroundImage: `url(${process.env.PUBLIC_URL}/header-right-600.png)`, // Make sure the image name matches the file in your public directory
        backgroundSize: 'cover',
        zIndex: -1
      }
    }}>
      {/* Position the vector graphic */}
      <Box sx={{
        position: 'absolute',
        top: 50, // adjust as necessary
        right: 0, // adjust as necessary
        height: '600px', // adjust to the size of your image
        width: 'auto',
        backgroundImage: `url(${process.env.PUBLIC_URL}/header-right-600.png)`, // Make sure the image name matches the file in your public directory
        backgroundRepeat: 'no-repeat',
        zIndex: -1
      }} />

      <Container maxWidth="sm">
        <Card sx={{
          maxWidth: 400,
          mx: 'auto',
          p: 3,
          boxShadow: 3,
          backgroundColor: 'rgba(255,255,255,0.9)'
        }}>
          <CardContent>
            <Typography variant="h5" sx={{
              fontFamily: '"Indie Flower", cursive',
              color: '#ff79c6',
              textAlign: 'center',
              mb: 3
            }}>
              Register to IndieSpace
            </Typography>
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}
            <form onSubmit={handleSubmit}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#ff79c6' },
                    '&:hover fieldset': { borderColor: '#ff79c6' },
                    '&.Mui-focused fieldset': { borderColor: '#ff79c6' }
                  },
                  mb: 2
                }}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#ff79c6' },
                    '&:hover fieldset': { borderColor: '#ff79c6' },
                    '&.Mui-focused fieldset': { borderColor: '#ff79c6' }
                  },
                  mb: 2
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  backgroundColor: '#ff79c6',
                  '&:hover': { backgroundColor: '#e35b9e' },
                  mt: 2,
                  color: 'white'
                }}
              >
                Register
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default RegistrationComponent;