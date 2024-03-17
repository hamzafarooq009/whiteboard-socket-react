const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Express session setup
app.use(session({
  secret: 'secret', // Choose a strong secret for session encryption
  resave: false,
  saveUninitialized: false,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Define users (this should be replaced with a database in production)
const users = [];

// Configure the local strategy for use by Passport.
passport.use(new LocalStrategy((username, password, done) => {
  const user = users.find(u => u.username === username);
  if (!user) {
    return done(null, false, { message: 'Incorrect username.' });
  }

  bcrypt.compare(password, user.password, (err, res) => {
    if (res) {
      // passwords match! log user in
      return done(null, user);
    } else {
      // passwords do not match!
      return done(null, false, { message: 'Incorrect password' });
    }
  });
}));

// In order to maintain persistent login sessions, Passport needs to serialize and deserialize user instances.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user);
});

// Routes
app.post('/login', passport.authenticate('local'), (req, res) => {
  res.send('Logged in');
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const id = users.length + 1;
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    users.push({ id, username, password: hashedPassword });
    res.send('User created');
  });
});

app.get('/logout', (req, res) => {
  req.logout();
  res.send('Logged out');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});