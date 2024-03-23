import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../component/AuthContext";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Modal,
  Box,
  TextField,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

function DashboardComponent() {
  const { isLoggedIn, currentUser } = useAuth();
  const navigate = useNavigate();
  const [whiteboards, setWhiteboards] = useState([]);
  const [newWhiteboardTitle, setNewWhiteboardTitle] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      fetch("http://localhost:3000/whiteboards", {
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => setWhiteboards(data))
        .catch((error) => console.error("Error fetching whiteboards:", error));
    }
  }, [isLoggedIn, navigate]);

  const createWhiteboard = () => {
    // Close modal and create whiteboard logic here
    setModalOpen(false);

    const requestBody = {
      title: newWhiteboardTitle,
      content: "Initial content",
    };

    fetch("http://localhost:3000/whiteboards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((newWhiteboard) => {
        setWhiteboards([...whiteboards, newWhiteboard]);
        setNewWhiteboardTitle("");
      })
      .catch((error) => {
        console.error("Error creating whiteboard:", error);
      });
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const goToWhiteboard = (id) => {
    navigate(`/whiteboard/${id}`);
  };

  // Modal style
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Card to add new whiteboard */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Card
            sx={{
              minHeight: 140,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CardContent
              onClick={handleOpenModal}
              style={{ textAlign: "center" }}
            >
              <AddIcon color="primary" style={{ fontSize: "3rem" }} />
              <Typography variant="h5">CREATE WHITEBOARD</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Cards for existing whiteboards */}
        {whiteboards.map((whiteboard, index) => (
          <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
            <Card sx={{ minHeight: 140 }}>
              <CardContent onClick={() => goToWhiteboard(whiteboard._id)}>
                <Typography variant="h5">{whiteboard.title}</Typography>
                <Typography color="textSecondary">
                  {whiteboard.owner?.username === currentUser?.username
                    ? "Owned by you"
                    : `Shared by ${whiteboard.owner?.username ?? "someone"}`}
                </Typography>
                <Typography color="textSecondary">
                  Updated: {new Date(whiteboard.updatedAt).toLocaleString()}
                </Typography>
                {/* You can add edit and delete actions here */}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Modal open={modalOpen} onClose={handleCloseModal}>
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
    </div>
  );
}

export default DashboardComponent;
