const loginJS = require('login-express');

// required
const dbConfig = {
	mongodbURI: process.env.MONGODB_URI,
	jwtSecret: process.env.JWT_SECRET,
};

// required
const appConfig = {
	jwtResetSecret: process.env.JWT_RESET_SECRET,
	emailFromUser: process.env.EMAIL_FROM_USER,
	emailFromPass: process.env.EMAIL_FROM_PASS,
	emailHost: process.env.EMAIL_HOST,
	emailPort: process.env.EMAIL_PORT,
	emailSecure: process.env.EMAIL_SECURE,
};

// Optional
// dbConfig.passwordLength = parseInt(process.env.ACCOUNT_PWD_LENGTH); // positive integer
// dbConfig.jwtSessionExpiration = parseInt(process.env.JWT_SESSION_EXPIRATION); // in seconds
// appConfig.jwtResetExpiration = parseInt(process.env.JWT_RESET_EXPIRATION); // in seconds

// Optional
let verifyEmailConfig = {
	emailHeading: 'Your Company Name',
	emailSubjectLine: 'Verify Password',
	emailMessage:
		'Custom verify password message goes here. Verify link auto-generated.',
};

// Optional
let resetEmailConfig = {
	emailHeading: 'Your Company Name',
	emailSubjectLine: 'Reset Password',
	emailMessage:
		'Custom reset password message goes here. Reset link auto-generated.',
};


loginJS(dbConfig, appConfig, verifyEmailConfig = {}, resetEmailConfig = {});
