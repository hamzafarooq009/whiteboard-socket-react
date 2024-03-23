const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const session = require('express-session');
const cors = require('cors');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const routes = require('./routes'); // Import routes
const { User } = require('./models'); // Import models

const app = express();
const server = http.createServer(app);


const corsOptions = {
  origin: ['http://localhost:3001', 'http://localhost:3002'], // Include all origins your app needs to accept
  credentials: true, // to allow cookies
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Add other methods as per your needs
};

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3002'], // Include all origins your app needs to accept
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Add other methods as per your needs
    credentials: true,
  },
});


app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


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

app.use(session({
  secret: 'mySuperSecretString123!@#',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if you're using HTTPS
}));


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());


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


// When a client connects
io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  socket.on('join whiteboard', (whiteboardId) => {
    socket.join(whiteboardId);
    console.log(`Socket ${socket.id} joined whiteboard ${whiteboardId}`);
  });

  socket.on('draw', (data) => {
    // Broadcast drawing data to all users in the same whiteboard room except the sender
    socket.to(data.whiteboardId).emit('draw', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Use the imported routes from routes.js
app.use('/', routes);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Replace app.listen with server.listen
// server.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });