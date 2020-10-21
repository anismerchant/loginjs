const express = require('express');
const app = express();
const helmet = require('helmet');

// for security: protects against well-known vulnerabilities
// sets http headers up-front
app.use(helmet());

// init middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
