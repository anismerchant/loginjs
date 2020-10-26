/*!
 * loginJS
 * Copyright(c) 2020 Anis Merchant
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

const express = require('express');
const app = express();
const helmet = require('helmet');
const connectDB = require('./config/db');
const registerUser = require('./routes/api/register');
const loginUser = require('./routes/api/login');
const resetPassword = require('./routes/api/reset');

function serverInit() {
	// protects against well-known vulnerabilities
	// sets http headers up-front
	app.use(helmet());

	// initialize middleware
	app.use(express.urlencoded({ extended: true }));
	app.use(express.json());

	// initialize and listen on port
	const PORT = process.env.PORT || 5000;
	app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

	return app;
}

/**
 * Expose `createApplication()`.
 */

exports = module.exports = createApplication;

/**
 * Create a loginJS application.
 * @api public
 */

function createApplication(loginConfig, resetConfig) {
	// start server
	serverInit();

	// connect database
	connectDB(loginConfig.required.mongodbURI);

	// create login system
	createLogin(loginConfig);

	// create reset password system
	createResetPassword(loginConfig, resetConfig);
}

/**
 * Expose helper function
 * @api public
 */

exports.createLogin = createLogin;

function createLogin(
	{
		required: { mongodbURI, jwtSecret },
		optional: { passwordLength = 8, jwtExpiration = 7200 },
	},
	launchApp = false
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

		if (launchApp) {
			// start server
			serverInit();

			// connect database
			connectDB(mongodbURI);
		}

		// define routes
		app.use(
			'/api/register',
			registerUser(jwtSecret, passwordLength, jwtExpiration)
		);
		app.use('/api/login', loginUser(jwtSecret, jwtExpiration));
	} catch (err) {
		console.error(err.message);
	}
}

function createResetPassword(
	{ optional: { passwordLength = 8 } },
	{ jwtResetSecret, jwtExpiration }
) {
	try {
		if (!Number.isInteger(jwtExpiration) || jwtExpiration < 0) {
			return console.log('"jwtExpiration" must be a positive integer.');
		}

		// define routes
		app.use(
			'/api/forgot-password',
			resetPassword(jwtResetSecret, jwtExpiration, passwordLength)
		);
		app.use(
			'/api/reset-password',
			resetPassword(jwtResetSecret, jwtExpiration, passwordLength)
		);
	} catch (err) {
		console.error(err.message);
	}
}
