/**
 * Module dependencies.
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { signUpUser } = require('../../controllers/register');

exports = module.exports = registerUser;

function registerUser(jwtSecret, passwordLength, jwtSessionExpiration) {
	// @route  POST api/users
	// @desc   Register user
	// @access Public >> access private routes after auth successful
	router.post(
		'/',
		[
			body('name', 'Name is required.').not().isEmpty(),
			body('email', 'Please include a valid email.').isEmail(),
			body(
				'password',
				`Please enter a password with ${passwordLength} or more characters.`
			).isLength({ min: passwordLength }),
		],
		signUpUser(jwtSecret, jwtSessionExpiration)
	);

	return (module.exports = router);
}
