const loginJS = require('login-express');

// required
const loginConfig = {
	mongodbURI: process.env.MONGODB_URI,
	jwtSecret: process.env.JWT_SECRET,
};

// Optional
// loginConfig.passwordLength = parseInt(process.env.ACCOUNT_PWD_LENGTH); // positive integer
// loginConfig.jwtSessionExpiration = parseInt(process.env.JWT_SESSION_EXPIRATION); // in seconds

// required
const resetConfig = {
	jwtResetSecret: process.env.JWT_RESET_SECRET,
	emailFromUser: process.env.EMAIL_FROM_USER,
	emailFromPass: process.env.EMAIL_FROM_PASS,
	emailHost: process.env.EMAIL_HOST,
	emailPort: process.env.EMAIL_PORT,
	emailSecure: process.env.EMAIL_SECURE,
};

// Optional
// resetConfig.jwtResetExpiration = parseInt(process.env.JWT_RESET_EXPIRATION); // in seconds
// resetConfig.emailHeading = 'Your Company Name';
// resetConfig.emailSubjectLine = 'Reset Password';
// resetConfig.emailMessage = 'Custom reset password message goes here. Reset password link will be autogenerated.';

// required
const verifyEmailConfig = {
	emailFromUser: process.env.EMAIL_FROM_USER,
	emailFromPass: process.env.EMAIL_FROM_PASS,
	emailHost: process.env.EMAIL_HOST,
	emailPort: process.env.EMAIL_PORT,
	emailSecure: process.env.EMAIL_SECURE,
}

// Optional
// verifyEmailConfig.emailHeading = 'Your Company Name';
// verifyEmailConfig.emailSubjectLine = 'Reset Password';
// verifyEmailConfig.emailMessage = 'Custom reset password message goes here. Reset password link will be autogenerated.';

loginJS(loginConfig, resetConfig, verifyEmailConfig);