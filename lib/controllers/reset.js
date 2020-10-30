/**
 * Module dependencies.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
const User = require('../models/User');

exports.sendResetLink = (
	jwtResetSecret,
	jwtResetExpiration,
	emailFromUser,
	emailFromPass,
	emailHeading,
	emailSubjectLine,
	emailHost,
	emailPort,
	emailSecure,
	emailMessage
) => async (req, res) => {
	// Finds the validation errors in this request and wraps them in an object with handy functions
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { email } = req.body;

	try {
		let user = await User.findOne({ email });
		// check if user exists
		if (!user) {
			return res.status(400).json({
				errors: [{ msg: 'User with this email does not exist.' }],
			});
		}

		const payload = {
			user: {
				id: user.id,
			},
		};

		const token = jwt.sign(payload, jwtResetSecret, {
			expiresIn: jwtResetExpiration, // in seconds
		});

		const sendMail = async (token) => {
			const link = `<h4><a href="https://${req.headers.host}/reset-password/${token}">Reset Password</a></h4>`;
			const output = `
        <div style="margin: auto; width: 40%; padding: 10px">
          <h2>Password Assistance</h2>
          <p>To authenticate, please click on the Reset Password link below. It will expire in ${Math.floor(jwtResetExpiration / 60)} minutes.</p>
          ${link}
          <p>Do not share this link with anyone. We take your account security very seriously. We will never ask you to disclose or verify your password, OTP, credit card, or banking account number. If you receive a suspicious email with a link to update your account information, do not click on the link. Instead, notify us immediately and share the email with us for investigation.</p>
          <p>We hope to see you again soon.</p>	
        </div>
			`;

			if (emailMessage) {
				emailMessage = `${emailMessage}<br>${link}`;
			}

			// create reusable transporter object using the default SMTP transport
			let transporter = nodemailer.createTransport({
				host: emailHost,
				port: emailPort,
				secure: emailSecure, // true for 465, false for other ports
				auth: {
					user: emailFromUser,
					pass: emailFromPass,
				},
				// for local host development
				tls: {
					rejectUnauthorized: false,
				},
			});

			const setFromText = emailHeading
				? `${emailHeading} ${emailFromUser}`	
				: emailFromUser;

			// send mail with defined transport object
			let info = await transporter.sendMail({
				from: setFromText, // sender address
				to: email, // list of receivers
				subject: emailSubjectLine || 'Reset Password Request', // subject line
				html: emailMessage || output, // html body
			});

			console.log('Message sent: %s', info.messageId);
			console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
		};

		return user.updateOne({ resetToken: token }, (err, success) => {
			if (err) {
				return res
					.status(400)
					.json({ msg: { error: 'Reset password link error.' } });
			} else {
				sendMail(token);
				return res.json({
					msg:
						'Password reset link has been sent to your email address. Please follow the instructions.',
				});
			}
		});
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
};

exports.updatePassword = (jwtResetSecret) => async (req, res) => {
	// Finds the validation errors in this request and wraps them in an object with handy functions
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	// sent from client-side
	const { resetToken, newPassword } = req.body;

	if (!resetToken) {
		return res.status(401).json({ msg: { error: 'Authentication Error.' } });
	}

	try {
		jwt.verify(resetToken, jwtResetSecret, async (error, decoded) => {
			if (error) {
				return res.status(401).json({
					msg: { error: 'Token has either expired or is invalid.' },
				});
			} else {
				await User.findOne({ resetToken: resetToken }, async (err, user) => {
					if (err || !user) {
						return res.status(400).json({
							msg: { error: 'User with this token does not exist.' },
						});
					}

					// encrypt password: convert text password to a hash value
					const salt = await bcrypt.genSalt(10);

					// saving hashed password to user object
					user.password = await bcrypt.hash(newPassword, salt);
					user.resetToken = '';

					// save user object in mongodb
					// this returns a promise from which we can grab 'id'
					// note: mongoose abstracts '_id' to 'id'
					await user.save((err, result) => {
						if (err) {
							return res.status(400).json({
								msg: { error: 'Password was not reset. Server error.' },
							});
						} else {
							return res.json({
								msg: 'Your password has been reset. Please login with your new password.',
							});
						}
					});
				});
			}
		});
	} catch (err) {
		console.error(err.message);
		res.status(401).send('Server Error');
	}
};
