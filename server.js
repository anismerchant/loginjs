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

exports = module.exports = appInit;

function appInit({ required, optional }) {
	// protects against well-known vulnerabilities
	// and sets http headers up-front
	app.use(helmet());

	// connect database
	connectDB(required.mongodbURI);

	// init middleware
	app.use(express.urlencoded({ extended: true }));
	app.use(express.json());

	// create login system
	createLogin(required, optional);

	// initialize and listen on port
	const PORT = process.env.PORT || 5000;
	app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

function createLogin(
	{ jwtSecret },
	{ passwordLength = 8, jwtExpiration = 7200 }
) {
	// validate optional parameter type
	try {
		if (!Number.isInteger(passwordLength) || !Number.isInteger(jwtExpiration)) {
			return console.log(
				'"passwordLength" and "jwtExpiration" must be positive integers.'
			);
		}

		if (passwordLength < 0 || jwtExpiration < 0) {
			return console.log(
				'"passwordLength" and "jwtExpiration" must be positive integers.'
			);
		}

		// define routes
		app.use(
			'/api/register',
			registerUser(jwtSecret, passwordLength, jwtExpiration)
		);
		app.use('/api/login', loginUser(jwtSecret, jwtExpiration));
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
}

// TODO: Build password reset system
function createPasswordReset() {
	try {
		// define routes
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
}
