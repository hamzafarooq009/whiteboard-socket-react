import React from 'react';
import { Link } from 'react-router-dom';

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

  return (
    <div style={indieStyle.container}>
      <h1 style={indieStyle.header}>Welcome to IndieSpace</h1>
      <p style={indieStyle.tagline}>
        Explore the canvas of independent creators.
      </p>
      <Link to="/dashboard">
        <button style={indieStyle.button}>Enter the Space</button>
      </Link>
    </div>
  );
}

export default HomePage;
