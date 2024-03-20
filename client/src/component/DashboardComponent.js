import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../component/AuthContext";

function DashboardComponent() {
    const { isLoggedIn, currentUser } = useAuth(); // Destructure currentUser from context
    const navigate = useNavigate();
  const [whiteboards, setWhiteboards] = useState([]);
  const [newWhiteboardTitle, setNewWhiteboardTitle] = useState("");

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
    const requestBody = {
      title: newWhiteboardTitle,
      content: "Initial content", // Adjust this as needed
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

  const goToWhiteboard = (id) => {
    // Navigate to the specific whiteboard view
    navigate(`/whiteboard/${id}`);
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <input
        type="text"
        placeholder="New Whiteboard Title"
        value={newWhiteboardTitle}
        onChange={(e) => setNewWhiteboardTitle(e.target.value)}
      />
      <button onClick={createWhiteboard}>Create Whiteboard</button>
      <div>
        // Inside DashboardComponent's return statement
        {whiteboards.map((whiteboard, index) => (
          <div
            key={index}
            style={{ cursor: "pointer" }}
            onClick={() => goToWhiteboard(whiteboard._id)}
          >
            <h2>{whiteboard.title}</h2>
            <p>
              {whiteboard.owner.username === currentUser.username
                ? "Owned by you"
                : `Shared by ${whiteboard.owner.username}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardComponent;
