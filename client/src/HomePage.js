import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Card, CardContent, Grid } from '@mui/material';
import CreateIcon from '@mui/icons-material/Create'; // example icon
import GroupWorkIcon from '@mui/icons-material/GroupWork'; // example icon
import VisibilityIcon from '@mui/icons-material/Visibility'; // example icon

function HomePage() {
  const indieStyle = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: '"Indie Flower", cursive', // Example using a Google Font
      textAlign: 'center',
      backgroundColor: '#f8f8f2',
      color: '#282a36',
      padding: '2rem',
    },
    header: {
      fontSize: '4rem',
      color: '#ff79c6',
      marginBottom: '1rem',
    },
    tagline: {
      fontSize: '1.5rem',
      fontStyle: 'italic',
      margin: '1rem 0',
    },
    button: {
      backgroundColor: '#8be9fd',
      color: '#282a36',
      padding: '1rem 2rem',
      borderRadius: '30px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      boxShadow: '4px 4px 0px #6272a4',
      transition: 'transform 0.1s ease-in-out',
    },
  };

  const featureStyle = {
    featureCard: {
      backgroundColor: '#7d5ba6',
      color: '#f8f8f2',
      margin: '1rem',
      padding: '2rem',
      borderRadius: '16px',
    },
    featureIcon: {
      fontSize: '2.5rem',
      color: '#50fa7b',
    },
    featureText: {
      fontSize: '1.2rem',
      margin: '0.5rem 0',
    },
  };


 return (
    <Box sx={{ ...indieStyle.container }}>
    <h1 style={indieStyle.header}>Welcome to IndieSpace</h1>

      <Typography sx={{ ...indieStyle.tagline }}>
        Explore the canvas of independent creators.
      </Typography>
      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <Button variant="contained" sx={{ ...indieStyle.button }}>
          Enter the Space
        </Button>
      </Link>

      {/* Feature Section */}
      <Box sx={{ width: '100%', marginTop: '3rem' }}>
      <h1 style={indieStyle.header}>Empowering Creators</h1>

        <Grid container justifyContent="center" alignItems="center">
          <Grid item xs={12} sm={4}>
            <Card sx={{ ...featureStyle.featureCard }}>
              <CreateIcon sx={{ ...featureStyle.featureIcon }} />
              <Typography sx={{ ...featureStyle.featureText }}>
                Draw your ideas into existence with our intuitive tools.
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ ...featureStyle.featureCard }}>
              <GroupWorkIcon sx={{ ...featureStyle.featureIcon }} />
              <Typography sx={{ ...featureStyle.featureText }}>
                Collaborate in real-time with a team across the globe.
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ ...featureStyle.featureCard }}>
              <VisibilityIcon sx={{ ...featureStyle.featureIcon }} />
              <Typography sx={{ ...featureStyle.featureText }}>
                Share your creations and get instant feedback.
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
      {/* Add more content here as needed */}
    </Box>
  );
}

export default HomePage;