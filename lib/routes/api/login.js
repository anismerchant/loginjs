/**
 * Module dependencies.
 */

const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { body } = require('express-validator');
const { getLoginUserInfo, signInUser } = require('../../controllers/login');

exports = module.exports = loginUser;

function loginUser(jwtSecret, jwtExpiration) {
	// @route  GET api/auth
	// @desc   Get auth user
	// @access Private
	router.get('/', auth, getLoginUserInfo);

	// @route   POST api/auth
	// @desc    Login user
	// @access  Public >> access private routes after auth successful
	// user logs in with email and password
	router.post(
		'/',
		[
			body('email', 'Please provide a valid email.').isEmail(),
			body('password', 'Password is required.').exists(),
		],
		signInUser(jwtSecret, jwtExpiration)
	);

	return (module.exports = router);
}
