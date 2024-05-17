import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {
  Container,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
} from "@mui/material";


function LoginComponent() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setIsLoggedIn } = useAuth();
  const navigate = useNavigate();

  const indieLoginStyle = {
    container: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "linear-gradient(135deg, #9575cd 30%, #7e57c2 90%)", // Gradient background

      padding: "1rem",
    },
    card: {
      minWidth: 275,
      background: "rgba(255, 255, 255, 0.8)", // Translucent card
      borderRadius: "15px",
      padding: "2rem",
      boxShadow: "0 4px 10px 0 rgba(0, 0, 0, 0.2)",
    },
    title: {
      fontSize: "2rem",
      color: "#6a1b9a", // Darker purple for contrast
      fontWeight: "bold",
      marginBottom: "1rem",
    },
    button: {
      backgroundColor: "#7d5ba6",
      color: "white",
      marginTop: "24px",
      padding: "10px 15px",
      borderRadius: "20px",
      fontSize: "1rem",
      fontWeight: "bold",
      "&:hover": {
        backgroundColor: "#6a1b9a",
      },
    },
    // More styles...
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json(); // This expects the server to send a JSON response
      if (data.user) {
        setIsLoggedIn(true);
        localStorage.setItem("currentUser", JSON.stringify(data.user)); // Store the user data
        navigate("/dashboard");
      } else {
        alert(data.message); // Or however you want to handle this message
      }
    } else {
      alert("Login failed. Please try again.");
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Grid container>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            backgroundImage: `url("https://www.dreamhost.com/blog/wp-content/uploads/2023/01/Homepage-Hero-Design-Feature-730x486.jpg")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "100%",
          }}
        />

        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Container style={indieLoginStyle.container}>
            <Card sx={indieLoginStyle.card}>
              <CardContent>
              <Typography variant="h5" sx={{
              fontFamily: '"Indie Flower", cursive',
              color: '##7d5ba6',
              textAlign: 'center',
              mb: 3
            }}>
                  Sign into IndieSpace
                </Typography>
                {/* existing form... */}
                <form onSubmit={handleSubmit} noValidate>
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
                    sx={{ marginTop: "16px" }}
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
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ marginTop: "16px" }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    style={indieLoginStyle.button}
                  >
                    SIGN IN
                  </Button>
                </form>
                {/* More components... */}
              </CardContent>
            </Card>
          </Container>
        </Grid>
      </Grid>
    </Box>
  );
}

export default LoginComponent;
