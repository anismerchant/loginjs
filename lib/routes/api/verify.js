const express = require('express');
const router = express.Router();
const { verifyEmail } = require('../../controllers/verify');

exports = module.exports = verifyUser;

function verifyUser(jwtSecret) {
	// @route  PATCH api/auth
	// @desc   Verify Email
	// @access Private
	router.patch(
		'/',
		verifyEmail(jwtSecret)
	);

	return (module.exports = router);
}
