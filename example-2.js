const createLogin = loginJS.createLogin;

const loginConfig = {
	mongodbURI: process.env.MONGODB_URI,
	jwtSecret: process.env.JWT_SECRET,
};

// Optional
// loginConfig.passwordLength = parseInt(process.env.ACCOUNT_PWD_LENGTH); // positive integer
// loginConfig.jwtExpiration = parseInt(process.env.JWT_SESSION_EXPIRATION); // in seconds

// Login system without reset password feature
createLogin(loginConfig, launchApp = true);
