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
				req.user = decoded.user;
				await User.findById(req.user.id, async (err, user) => {
					if (err || !user) {
						return res.status(400).json({
							msg: {
								error: 'User with this token does not exist.',
							},
						});
					}
					if (user.verifyEmail) {
						return res.json({
							msg: 'You have already verified your email address. Thank you.',
						});
					}

					if (verifyEmailToken === user.verifyEmailToken.toString()) {
						user.verifyEmail = true;
						user.verifyEmailToken = '';

						await user.save((err, result) => {
							if (err) {
								return res.status(400).json({
									msg: { error: 'Email not verified. Server error.' },
								});
							} else {
								return res.json({
									msg: 'Thank you for verifying your email address.',
								});
							}
						});
					} else {
						return res.status(401).json({
							msg: { error: 'Token has either expired or is invalid.' },
						});
					}
				});
			}
		});
	} catch (err) {
		console.error(err.message);
		res.status(401).send('Server Error');
	}
};
