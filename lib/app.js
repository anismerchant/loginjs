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

function createApplication(loginConfig, resetConfig, verifyEmailConfig) {
	// start server
	serverInit();

	// connect database
	connectDB(loginConfig.mongodbURI);

	// create login system
	createLogin(loginConfig, verifyEmailConfig);

	// create reset password system
	createResetPassword(loginConfig, resetConfig);
}

/**
 * Expose helper function
 * @api public
 */

exports.createLogin = createLogin;

function createLogin(
	{ mongodbURI, jwtSecret, passwordLength = 8, jwtSessionExpiration = 7200 },
	{
		emailFromUser,
		emailFromPass,
		emailHeading,
		emailSubjectLine,
		emailHost,
		emailPort,
		emailSecure,
		emailMessage = '',
	},
	launchApp = false
) {
	// validate optional parameter type
	try {
		if (
			!Number.isInteger(passwordLength) ||
			!Number.isInteger(jwtSessionExpiration)
		) {
			return console.log(
				'"passwordLength" and "jwtSessionExpiration" must be positive integers.'
			);
		}

		if (passwordLength < 0 || jwtSessionExpiration < 0) {
			return console.log(
				'"passwordLength" and "jwtSessionExpiration" must be positive integers.'
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
			registerUser(
				jwtSecret,
				passwordLength,
				jwtSessionExpiration,
				emailFromUser,
				emailFromPass,
				emailHeading,
				emailSubjectLine,
				emailHost,
				emailPort,
				emailSecure,
				emailMessage
			)
		);
		app.use('/api/login', loginUser(jwtSecret, jwtSessionExpiration));
		app.use('/api/verify-email', loginUser(jwtSecret, jwtSessionExpiration));
	} catch (err) {
		console.error(err.message);
	}
}

function createResetPassword(
	{ passwordLength = 8 },
	{
		jwtResetSecret,
		jwtResetExpiration = 900,
		emailFromUser,
		emailFromPass,
		emailHeading,
		emailSubjectLine,
		emailHost,
		emailPort,
		emailSecure,
		emailMessage = '',
	}
) {
	try {
		if (!Number.isInteger(jwtResetExpiration) || jwtResetExpiration < 0) {
			return console.log('"jwtResetExpiration" must be a positive integer.');
		}

		// define routes
		app.use(
			'/api/forgot-password',
			resetPassword(
				jwtResetSecret,
				jwtResetExpiration,
				passwordLength,
				emailFromUser,
				emailFromPass,
				emailHeading,
				emailSubjectLine,
				emailHost,
				emailPort,
				emailSecure,
				emailMessage
			)
		);
		app.use(
			'/api/reset-password',
			resetPassword(
				jwtResetSecret,
				jwtResetExpiration,
				passwordLength,
				emailFromUser,
				emailFromPass,
				emailHeading,
				emailSubjectLine,
				emailHost,
				emailPort,
				emailSecure,
				emailMessage
			)
		);
	} catch (err) {
		console.error(err.message);
	}
}
