'use strict';

/*!
 * loginJS
 * Author: Anis Merchant <anisxmerchant@gmail.com>
 * MIT Licensed
 */

const express = require('express');
const app = express();
const helmet = require('helmet');
const connectDB = require('./config/db');
const registerUser = require('./routes/api/register');
const loginUser = require('./routes/api/login');

exports = module.exports = createLogin;

function createLogin(mongodbURI, jwtSecret, register, login) {
	// protects against well-known vulnerabilities
	// and sets http headers up-front
	app.use(helmet());

	// connect database
	connectDB(mongodbURI);

	// init middleware
	app.use(express.urlencoded({ extended: true }));
	app.use(express.json());

	// define routes
	app.use(register, registerUser(jwtSecret));
	app.use(login, loginUser(jwtSecret));

	const PORT = process.env.PORT || 5000;

	app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}
