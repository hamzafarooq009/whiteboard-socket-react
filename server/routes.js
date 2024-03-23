// routes.js
const express = require("express");
const { User, Whiteboard } = require("./models");
const passport = require("passport");

const router = express.Router();

// Routes
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.send('Logged in');
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }
    
    const user = new User({ username, password });
    await user.save();
    res.send('User created');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error registering new user.');
  }
});


router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { 
      return next(err); 
    }
    res.send('Logged out');
  });
});


router.post('/whiteboards', async (req, res) => {
  if (!req.isAuthenticated()) {
      return res.status(401).send('User is not authenticated');
  }

  const { title, content } = req.body;
  const whiteboard = new Whiteboard({
      title,
      content,
      owner: req.user._id
  });

  try {
    const savedWhiteboard = await whiteboard.save();
    res.status(201).send(savedWhiteboard);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving the whiteboard');
  }
});


router.get('/whiteboards', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('User is not authenticated');
  }

  try {
    // Fetch whiteboards where the current user is either the owner or is in the sharedWith array
    const whiteboards = await Whiteboard.find({
      $or: [
        { owner: req.user._id },
        { sharedWith: req.user._id }
      ]
    }).populate('owner', 'username').exec(); // Optionally populate owner details

    res.send(whiteboards);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving whiteboards');
  }
});



// Server.js - GET /whiteboards/:id route
router.get('/whiteboards/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('User is not authenticated');
  }

  try {
    const whiteboard = await Whiteboard.findById(req.params.id);
    if (!whiteboard) {
      return res.status(404).send('Whiteboard not found');
    }
    if (!whiteboard.owner.equals(req.user._id) && !whiteboard.sharedWith.map(id => id.toString()).includes(req.user.id)) {
      return res.status(403).send('User is not authorized to view this whiteboard');
    }
    res.send(whiteboard);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving the whiteboard');
  }
});


router.put('/whiteboards/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('User is not authenticated');
  }

  try {
    const whiteboard = await Whiteboard.findById(req.params.id);
    if (!whiteboard) {
      return res.status(404).send('Whiteboard not found');
    }
    if (!whiteboard.owner.equals(req.user._id)) {
      return res.status(403).send('User is not authorized to update this whiteboard');
    }

    whiteboard.title = req.body.title || whiteboard.title;
    whiteboard.content = req.body.content || whiteboard.content;
    const updatedWhiteboard = await whiteboard.save();
    res.send(updatedWhiteboard);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating the whiteboard');
  }
});

router.delete('/whiteboards/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('User is not authenticated');
  }

  try {
    const whiteboard = await Whiteboard.findById(req.params.id);
    // In your GET /whiteboards/:id route
    if (!whiteboard.owner.equals(req.user._id) && !whiteboard.sharedWith.includes(req.user._id)) {
      return res.status(403).send('User is not authorized to view this whiteboard');
    }

    if (!whiteboard) {
      return res.status(404).send('Whiteboard not found');
    }
    if (!whiteboard.owner.equals(req.user._id)) {
      return res.status(403).send('User is not authorized to delete this whiteboard');
    }

    await Whiteboard.deleteOne({ _id: req.params.id });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting the whiteboard');
  }
});

router.put('/whiteboards/:id/share', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('User is not authenticated');
  }

  const { username } = req.body;
  try {
    const userToShareWith = await User.findOne({ username: username });
    if (!userToShareWith) {
      return res.status(404).send('User not found');
    }

    const whiteboard = await Whiteboard.findById(req.params.id);
    if (!whiteboard) {
      return res.status(404).send('Whiteboard not found');
    }

    if (!whiteboard.owner.equals(req.user._id)) {
      return res.status(403).send('User is not authorized to share this whiteboard');
    }

    if (!whiteboard.sharedWith.includes(userToShareWith._id)) {
      whiteboard.sharedWith.push(userToShareWith._id);
      await whiteboard.save();
    }

    res.send('Whiteboard shared successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error sharing the whiteboard');
  }
});


router.post('/whiteboards/:id/saveState', async (req, res) => {
  if (!req.isAuthenticated()) {
      return res.status(401).send('User is not authenticated');
  }

  const { canvasData } = req.body;
  try {
      const whiteboard = await Whiteboard.findById(req.params.id);
      if (!whiteboard) {
          return res.status(404).send('Whiteboard not found');
      }
      if (!whiteboard.owner.equals(req.user._id) && !whiteboard.sharedWith.includes(req.user._id)) {
          return res.status(403).send('User is not authorized to update this whiteboard');
      }

      whiteboard.canvasState = canvasData;
      await whiteboard.save();
      res.status(200).send('Canvas state saved');
  } catch (err) {
      console.error(err);
      res.status(500).send('Error saving canvas state');
  }
});

router.get('/whiteboards/:id/getState', async (req, res) => {
  if (!req.isAuthenticated()) {
      return res.status(401).send('User is not authenticated');
  }

  try {
      const whiteboard = await Whiteboard.findById(req.params.id);
      if (!whiteboard) {
          return res.status(404).send('Whiteboard not found');
      }
      if (!whiteboard.owner.equals(req.user._id) && !whiteboard.sharedWith.includes(req.user._id)) {
          return res.status(403).send('User is not authorized to view this whiteboard');
      }

      res.status(200).send({ canvasData: whiteboard.canvasState });
  } catch (err) {
      console.error(err);
      res.status(500).send('Error retrieving canvas state');
  }
});


// Testing
router.get('/test-auth', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('User is not authenticated');
  }
  return res.send('User is authenticated');
});

router.get('/current-user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('User is not authenticated');
  }

  // Assuming req.user is the user object added by Passport.js after successful authentication
  // You might want to limit the information sent back to the client for security reasons
  const userToSend = {
    id: req.user.id,
    username: req.user.username,
    // Add other fields as needed, but avoid sending sensitive information
  };

  res.send(userToSend);
});
module.exports = router;
