const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { User, Whiteboard } = require('./models');


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const mongoose = require('mongoose');


const uri = "mongodb+srv://hamzafarooqlums:pR17OqcaWM9eQkUb@cluster0.x9ngjfh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


// Connect to MongoDB
mongoose.connect(uri);

// Connection Events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error: ' + err);
});

mongoose.connection.once('open', () => {
  console.log('MongoDB connected successfully');
});


// // Express session setup
// app.use(session({
//   secret: 'secret', // Choose a strong secret for session encryption
//   resave: false,
//   saveUninitialized: false,
// }));

app.use(session({
  secret: 'mySuperSecretString123!@#',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if you're using HTTPS
}));


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Define users (this should be replaced with a database in production)
const users = [];

// Passport Local Strategy
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }

    user.comparePassword(password, (err, isMatch) => {
      if (err) return done(err);
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password.' });
      }
    });
  } catch (err) {
    return done(err);
  }
}));



// Serialization and deserialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Routes
app.post('/login', passport.authenticate('local'), (req, res) => {
  res.send('Logged in');
});

app.post('/register', async (req, res) => {
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


app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { 
      return next(err); 
    }
    res.send('Logged out');
  });
});


app.post('/whiteboards', async (req, res) => {
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


app.get('/whiteboards', async (req, res) => {
  if (!req.isAuthenticated()) {
      return res.status(401).send('User is not authenticated');
  }

  try {
      const whiteboards = await Whiteboard.find({ owner: req.user._id });
      res.send(whiteboards);
  } catch (err) {
      console.error(err);
      res.status(500).send('Error retrieving whiteboards');
  }
});


app.get('/whiteboards/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('User is not authenticated');
  }

  try {
    const whiteboard = await Whiteboard.findById(req.params.id);
    if (!whiteboard) {
      return res.status(404).send('Whiteboard not found');
    }
    if (!whiteboard.owner.equals(req.user._id)) {
      return res.status(403).send('User is not authorized to view this whiteboard');
    }
    res.send(whiteboard);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving the whiteboard');
  }
});


app.put('/whiteboards/:id', async (req, res) => {
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

app.delete('/whiteboards/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('User is not authenticated');
  }

  try {
    const whiteboard = await Whiteboard.findById(req.params.id);
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


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});