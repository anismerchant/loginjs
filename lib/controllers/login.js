/**
 * Module dependencies.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');

exports.getLoginUserInfo = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password');
		res.json(user);
	} catch (err) {
		console.log(err.message);
		res.status(500).send('Server Error');
	}
};

exports.signInUser = (jwtSecret, jwtSessionExpiration) => async (req, res) => {
	// Finds the validation errors in this request and wraps them in an object with handy functions
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { email, password } = req.body;

	try {
		let user = await User.findOne({ email });
		// check if user exists
		if (!user) {
			return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		// check if password entered at login matches what's stored in db
		if (!isMatch) {
			return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
		}

		const payload = {
			user: {
				id: user.id,
			},
		};

		jwt.sign(
			payload,
			jwtSecret,
			{
				expiresIn: jwtSessionExpiration, // in seconds
			},
			(err, token) => {
				if (err) throw err;
				res.json({ token });
			}
		);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};
