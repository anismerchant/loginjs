const express = require('express');
const app = express();
const helmet = require('helmet');
const connectDB = require('./config/db');
const users = require('./routes/api/users');
const auth = require('./routes/api/auth');

// protects against well-known vulnerabilities
// and sets http headers up-front
app.use(helmet());

// connect database
connectDB();

// @route  GET /
// @desc   Test route
// @access Public
app.get('/', (req, res) => res.send('API Running'));

// init middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// define routes
app.use('/api/users', users);
app.use('/api/auth', auth);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
