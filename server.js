const express = require('express');
const app = express();
const helmet = require('helmet');
const connectDB = require('./config/db');

// protects against well-known vulnerabilities
// and sets http headers up-front
app.use(helmet());

// connect database
connectDB();

// init middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
