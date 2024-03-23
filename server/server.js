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

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerConfig');

const app = express();
const server = http.createServer(app);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const corsOptions = {
  origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'], // Include all origins your app needs to accept
  credentials: true, // to allow cookies
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Add other methods as per your needs
};

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'], // Include all origins your app needs to accept
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

// At the top of your server.js file, define the socketUserMap
const socketUserMap = new Map();

io.on('connection', (socket) => {
  socket.on('join whiteboard', ({ whiteboardId, userId }) => {
    socket.join(whiteboardId);

    // Associate this socket with the user ID in some way.
    // Example: using a Map object where keys are socket IDs and values are user IDs.
    socketUserMap.set(socket.id, userId);

    console.log(`User ${userId} joined whiteboard ${whiteboardId} with socket ${socket.id}`);
  });

  // Later, when broadcasting or handling data:
  socket.on('draw', (data) => {
    // console.log('Received draw event', data);
    // Make sure the data includes the userId and use it to verify actions
    const userId = socketUserMap.get(socket.id);
    if (data.userId === userId) {
      socket.to(data.whiteboardId).emit('draw', data);
    }
  });


  socket.on('cursor move', (data) => {
    // Broadcast cursor move to other users in the same room
    socket.to(data.whiteboardId).emit('cursor move', data);
  });
  

  // Handle disconnection
  socket.on('disconnect', () => {
    // Clean up user association
    socketUserMap.delete(socket.id);
    console.log(`User with socket ${socket.id} disconnected`);
  });
});


// Use the imported routes from routes.js
app.use('/', routes);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});