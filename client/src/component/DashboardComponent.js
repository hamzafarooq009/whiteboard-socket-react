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

import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import AddIcon from "@mui/icons-material/Add";
import { pink, deepPurple, amber } from "@mui/material/colors";

function DashboardComponent() {
  const { isLoggedIn, currentUser } = useAuth();
  const navigate = useNavigate();
  const [whiteboards, setWhiteboards] = useState([]);
  const [newWhiteboardTitle, setNewWhiteboardTitle] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [currentBoardId, setCurrentBoardId] = useState(null);
  const [renameInput, setRenameInput] = useState("");

  // Define the theme styles directly within the component
  const theme = {
    palette: {
      primary: deepPurple[300],
      secondary: pink["A200"],
      background: {
        default: "#f8f8f2",
      },
    },
    typography: {
      fontFamily: '"Indie Flower", cursive',
    },
  };

  const handleMenuOpen = (event, boardId) => {
    setMenuAnchorEl(event.currentTarget);
    setCurrentBoardId(boardId);
    setRenameInput(""); // Reset rename input
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

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

  const renameWhiteboard = () => {
    if (!renameInput.trim()) return; // Check if the input is not just spaces

    const requestBody = {
      title: renameInput,
    };

    fetch(`http://localhost:3000/whiteboards/${currentBoardId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          setWhiteboards(
            whiteboards.map((board) =>
              board._id === currentBoardId
                ? { ...board, title: renameInput }
                : board
            )
          );
          handleMenuClose();
        } else {
          console.error("Error renaming whiteboard");
        }
      })
      .catch((error) => {
        console.error("Error renaming whiteboard:", error);
      });
  };

  const deleteWhiteboard = () => {
    fetch(`http://localhost:3000/whiteboards/${currentBoardId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          setWhiteboards(
            whiteboards.filter((board) => board._id !== currentBoardId)
          );
          handleMenuClose();
        } else {
          console.error("Error deleting whiteboard");
        }
      })
      .catch((error) => {
        console.error("Error deleting whiteboard:", error);
      });
  };

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        p: 3,
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontFamily: theme.typography.fontFamily,
          color: theme.palette.primary.main,
        }}
      >
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
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h5">{whiteboard.title}</Typography>
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, whiteboard._id)}
                    size="small"
                  >
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
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl && currentBoardId === whiteboard._id)}
              onClose={handleMenuClose}
            >
              <MenuItem
                onClick={() => {
                  const newName = prompt(
                    "Enter the new name for the whiteboard:"
                  );
                  if (newName && newName.trim()) {
                    setRenameInput(newName);
                    renameWhiteboard();
                  }
                }}
              >
                Rename
              </MenuItem>

              <MenuItem
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this whiteboard?"
                    )
                  ) {
                    deleteWhiteboard();
                  }
                }}
              >
                Delete
              </MenuItem>
              <MenuItem onClick={() => goToWhiteboard(whiteboard._id)}>
                Open Board
              </MenuItem>
            </Menu>
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
    </Box>
  );
}

export default DashboardComponent;
