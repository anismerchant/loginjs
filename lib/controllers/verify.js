const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.verifyEmail = (jwtSecret) => async (req, res) => {
	// sent from client-side
	const { verifyEmailToken } = req.body;

	if (!verifyEmailToken) {
		return res.status(401).json({ msg: { error: 'Authentication Error.' } });
	}

	try {
		jwt.verify(verifyEmailToken, jwtSecret, async (error, decoded) => {
			if (error) {
				return res.status(401).json({
					msg: { error: 'Token has either expired or is invalid.' },
				});
			} else {
				await User.findOne(
					{ verifyEmailToken: verifyEmailToken },
					async (err, user) => {
						if (err || !user) {
							return res.status(400).json({
								msg: { error: 'User with this token does not exist.' },
							});
						}

						user.verifyEmail = true;
						user.verifyEmailToken = '';

						await user.save((err, result) => {
							if (err) {
								return res.status(400).json({
									msg: { error: 'Email not verified. Server error.' },
								});
							} else {
								return res.json({
									msg: 'Thank you for verifying your email.',
								});
							}
						});
					}
				);
			}
		});
	} catch (err) {
		console.error(err.message);
		res.status(401).send('Server Error');
	}
};
