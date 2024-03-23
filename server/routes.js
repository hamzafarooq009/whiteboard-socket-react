// Importing necessary modules and initializing the router.
const express = require("express");
const { User, Whiteboard } = require("./models");
const passport = require("passport");

const router = express.Router();

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Logs in a user
 *     description: Authenticates a user by their credentials.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Authentication failed
 */
router.post('/login', passport.authenticate('local'), (req, res) => {
  const userData = req.user;
  res.json({ message: "Logged in", user: userData });
});

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registers a new user
 *     description: Creates a new user with the provided username and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: User already exists
 *       500:
 *         description: Error registering new user
 */
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
    // Logic to check if user exists and create a new user if not.

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

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Logs out the current user
 *     description: Ends the user's session.
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { 
      return next(err); 
    }
    res.send('Logged out');
  });
});

/**
 * @swagger
 * /whiteboards:
 *   post:
 *     summary: Creates a new whiteboard
 *     description: Adds a new whiteboard for the authenticated user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Whiteboard created successfully
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Error saving the whiteboard
 */
router.post('/whiteboards', async (req, res) => {
  // Authentication check and logic to create and save a new whiteboard.
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

/**
 * @swagger
 * /whiteboards:
 *   get:
 *     summary: Retrieves all whiteboards for the authenticated user
 *     description: Fetches a list of all whiteboards that belong to the authenticated user or shared with them.
 *     responses:
 *       200:
 *         description: A list of whiteboards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Whiteboard'
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Error retrieving whiteboards
 */
router.get('/whiteboards', async (req, res) => {
  // Authentication check and logic to fetch user-related whiteboards.
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



/**
 * @swagger
 * /whiteboards/{id}:
 *   get:
 *     summary: Retrieve a specific whiteboard
 *     description: Fetches a specific whiteboard by its ID if the user has access to it.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The whiteboard ID
 *     responses:
 *       200:
 *         description: The whiteboard object
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: User is not authorized to view this whiteboard
 *       404:
 *         description: Whiteboard not found
 *       500:
 *         description: Error retrieving the whiteboard
 */
router.get('/whiteboards/:id', async (req, res) => {
  // Authentication and authorization checks and logic to fetch a specific whiteboard.
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


/**
 * @swagger
 * /whiteboards/{id}:
 *   put:
 *     summary: Update a specific whiteboard
 *     description: Updates the whiteboard's title and content if the user is the owner.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The whiteboard ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: The updated whiteboard
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: User is not authorized to update this whiteboard
 *       404:
 *         description: Whiteboard not found
 *       500:
 *         description: Error updating the whiteboard
 */
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

/**
 * @swagger
 * /whiteboards/{id}:
 *   delete:
 *     summary: Delete a specific whiteboard
 *     description: Deletes a specific whiteboard if the user is the owner.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The whiteboard ID
 *     responses:
 *       204:
 *         description: Whiteboard deleted successfully
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: User is not authorized to delete this whiteboard
 *       404:
 *         description: Whiteboard not found
 *       500:
 *         description: Error deleting the whiteboard
 */
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

/**
 * @swagger
 * /whiteboards/{id}/share:
 *   put:
 *     summary: Share a whiteboard with another user
 *     description: Shares the specified whiteboard with another user if the current user is the owner.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The whiteboard ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Whiteboard shared successfully
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: User is not authorized to share this whiteboard
 *       404:
 *         description: User or whiteboard not found
 *       500:
 *         description: Error sharing the whiteboard
 */
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


/**
 * @swagger
 * /whiteboards/{id}/saveState:
 *   post:
 *     summary: Saves the state of a whiteboard
 *     description: Persists the current state of a whiteboard to the database.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The whiteboard ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - canvasData
 *             properties:
 *               canvasData:
 *                 type: string
 *     responses:
 *       200:
 *         description: Canvas state saved successfully
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: Whiteboard not found
 *       403:
 *         description: User not authorized to update this whiteboard
 *       500:
 *         description: Error saving canvas state
 */
router.post('/whiteboards/:id/saveState', async (req, res) => {
  // Authentication and authorization checks and logic to save the current state of a whiteboard.
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

/**
 * @swagger
 * /whiteboards/{id}/getState:
 *   get:
 *     summary: Retrieves the state of a whiteboard
 *     description: Fetches the saved state of a specific whiteboard.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The whiteboard ID
 *     responses:
 *       200:
 *         description: Canvas state retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 canvasData:
 *                   type: string
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: Whiteboard not found
 *       403:
 *         description: User not authorized to view this whiteboard
 *       500:
 *         description: Error retrieving canvas state
 */
router.get('/whiteboards/:id/getState', async (req, res) => {
  // Authentication and authorization checks and logic to retrieve the saved state of a whiteboard.
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


/**
 * @swagger
 * /test-auth:
 *   get:
 *     summary: Tests if the user is authenticated
 *     description: A simple endpoint to check user authentication status.
 *     responses:
 *       200:
 *         description: User is authenticated
 *       401:
 *         description: User is not authenticated
 */
router.get('/test-auth', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('User is not authenticated');
  }
  return res.send('User is authenticated');
});

/**
 * @swagger
 * /current-user:
 *   get:
 *     summary: Retrieves the current user
 *     description: Provides information about the currently authenticated user.
 *     responses:
 *       200:
 *         description: Current user data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *       401:
 *         description: User is not authenticated
 */
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

// Exporting the configured router.
module.exports = router;
