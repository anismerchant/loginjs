const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const User = require('../../models/User');

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
			'Please enter a password with 7 or more characters.'
		).isLength({ min: 7 }),
	],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, password } = req.body;

		try {
			// check if user exists
			let user = await User.findOne({ email });

			if (user) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'User already exits.' }] });
			}

			// get user's gravatar
			const avatar = gravatar.url(email, {
				s: '200',
				r: 'pg',
				d: 'mm',
			});

			// create a new instance of user
			user = new User({
				name,
				email,
				avatar,
				password,
			});

			// create a new instance of user
			user = new User({
				name,
				email,
				avatar,
				password,
			});

			// encrypt password: convert text password to a hash value
			const salt = await bcrypt.genSalt(10);

			// saving hashed password to user object
			user.password = await bcrypt.hash(password, salt);

      // save user object in mongodb
      // this returns a promise from which we can grab 'id'
      // note: mongoose abstracts '_id' to 'id'
			await user.save();

			// create payload
			const payload = {
				user: {
					id: user.id,
				},
			};

			// sign the token with payload and secret
			jwt.sign(
				payload,
				process.env.JWT_SECRET,
				{
					expiresIn: 7200, // in seconds
				},
				(err, token) => {
					if (err) throw err;
					res.json({ token });
				}
			);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server error');
		}
	}
);

module.exports = router;
