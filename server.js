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

// de-structure loginConfig
function createLogin({
	required: { mongodbURI, jwtSecret, registerRoute, loginRoute },
	optional: { passwordLength = 8, jwtExpiration = 7200 },
}) {
	// protects against well-known vulnerabilities
	// and sets http headers up-front
	app.use(helmet());

	// connect database
	connectDB(mongodbURI);

	// init middleware
	app.use(express.urlencoded({ extended: true }));
	app.use(express.json());

	// validate optional parameter type
	try {
		if (!Number.isInteger(passwordLength) || !Number.isInteger(jwtExpiration)) {
			return console.log(
				'"passwordLength" and "jwtExpiration" must be integers.'
			);
		}

		// define routes
		app.use(
			registerRoute,
			registerUser(jwtSecret, passwordLength, jwtExpiration)
		);
		app.use(loginRoute, loginUser(jwtSecret, jwtExpiration));
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}

	const PORT = process.env.PORT || 5000;

	app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}
