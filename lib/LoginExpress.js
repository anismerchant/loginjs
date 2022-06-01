const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const sendMail = require('./helper/sendMail');
const User = require('./models/User');

/**
 * Authentication Manager class.
 */
class LoginExpress {
  /**
   * Validate config object, initialize variables and connect to database.
   */
  constructor({
    jwtSecret,
    jwtResetSecret,
    emailFromUser,
    emailFromPass,
    emailHost,
    mongoDbUri,
    clientBaseUrl,
    emailPort = 465,
    emailSecure = true,
    verifyEmailHeading = '',
    verifyEmailSubjectLine = '',
    verifyEmailMessage = '',
    verifyEmailRedirect = '/verify-email',
    resetEmailHeading = '',
    resetEmailSubjectLine = '',
    resetEmailMessage = '',
    resetEmailRedirect = 'reset-password',
    passwordLength = 8,
    jwtSessionExpiration = 7200,
    jwtResetExpiration = 900,
  }) {
    // validate config
    if (
      !Number.isInteger(passwordLength) ||
      !Number.isInteger(jwtSessionExpiration)
    ) {
      throw new Error(
        '"passwordLength" and "jwtSessionExpiration" must be positive integers.'
      );
    }
    if (passwordLength < 0 || jwtSessionExpiration < 0) {
      throw new Error(
        '"passwordLength" and "jwtSessionExpiration" must be positive integers.'
      );
    }
    if (
      !jwtSecret ||
      !jwtResetSecret ||
      !emailFromUser ||
      !emailFromPass ||
      !emailHost ||
      !mongoDbUri ||
      !clientBaseUrl
    ) {
      throw new Error(
        'Missing required config. Make sure you have the following in your config object: jwtSecret, jwtResetSecret, emailFromUser, emailFromPass, emailHost, mongoDbUri, clientBaseUrl'
      );
    }

    // assign class variables
    this.jwtSecret = jwtSecret;
    this.jwtResetSecret = jwtResetSecret;
    this.emailFromUser = emailFromUser;
    this.emailFromPass = emailFromPass;
    this.emailHost = emailHost;
    this.emailPort = emailPort;
    this.emailSecure = emailSecure;
    this.clientBaseUrl = clientBaseUrl;
    this.verifyEmailHeading = verifyEmailHeading;
    this.verifyEmailSubjectLine = verifyEmailSubjectLine;
    this.verifyEmailMessage = verifyEmailMessage;
    this.verifyEmailRedirect = verifyEmailRedirect;
    this.resetEmailHeading = resetEmailHeading;
    this.resetEmailSubjectLine = resetEmailSubjectLine;
    this.resetEmailMessage = resetEmailMessage;
    this.resetEmailRedirect = resetEmailRedirect;
    this.passwordLength = passwordLength;
    this.jwtSessionExpiration = jwtSessionExpiration;
    this.jwtResetExpiration = jwtResetExpiration;

    // connect to database
    connectDB(mongoDbUri);
  }

  /**
   * Registers a user with given name, email and password.
   */
  register = async ({ name, email, password }) => {
    try {
      // check if user exists
      let user = await User.findOne({ email });
      if (user) {
        throw new Error('User already exists.');
      }

      // get user's gravatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });

      // encrypt password: convert text password to a hash value
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // create a new instance of user
      user = new User({
        name,
        email,
        avatar,
        password: hashedPassword,
      });

      // create payload
      const payload = {
        user: {
          id: user.id,
        },
      };

      // sign the token with payload and secret
      const token = jwt.sign(payload, this.jwtSecret, {
        expiresIn: this.jwtSessionExpiration, // in seconds
      });

      // update user with verification token
      console.log(token);
      user.verifyEmail = false;
      user.verifyEmailToken = token;

      // save user object in mongodb
      await user.save();

      // create email template
      const redirect = `${this.clientBaseUrl}${this.verifyEmailRedirect}`;
      const defaultLink = `<h4><a href="${redirect}/${token}">Verify Email Address</a></h4>`;
      const defaultMessage = `
        <div style="margin: auto; width: 40%; padding: 10px">
          <h2>Email Verification Request</h2>
          <p>To verify your email address so you can continue to use your account, click the following link:</p>
          ${defaultLink}
          <p>Thanks for joining the community.</p>	
        </div>`;
      const defaultSubjectLine = 'Please Verify Your Email Address';

      // send mail
      sendMail(
        email,
        defaultLink,
        defaultMessage,
        defaultSubjectLine,
        this.emailFromUser,
        this.emailFromPass,
        this.verifyEmailHeading,
        this.verifyEmailSubjectLine,
        this.emailHost,
        this.emailPort,
        this.emailSecure,
        this.verifyEmailMessage
      );
    } catch (err) {
      console.error(err);
      throw new Error('Registration failed.');
    }
  };

  /**
   * Verifies user with given verification token.
   */
  verify = async (token) => {
    // token is missing
    if (!token) {
      throw new Error('Authentication Error.');
    }

    // get user from token
    let user;
    try {
      const payload = jwt.verify(token, this.jwtSecret);
      user = await User.findById(payload.user.id);
    } catch (err) {
      console.error(err);
      throw new Error('Token has either expired or is invalid');
    }

    // user does not exist
    if (!user) {
      throw new Error('Token has either expired or is invalid');
    }

    // user is already verified
    if (user.verifyEmail === true) {
      throw new Error(
        'You have already verified your email address. Thank you.'
      );
    }

    // verify user
    else {
      user.verifyEmail = true;
      user.verifyEmailToken = '';
      try {
        await user.save();
      } catch (err) {
        console.error(err);
        throw new Error('Internal Server Error');
      }
    }
  };

  /**
   * Logs in user with given email and password and returns a session token.
   */
  login = async ({ email, password }) => {
    let token;

    try {
      // validate email
      let user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid Credentials.');
      }

      // validate password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error('Invalid Credentials.');
      }

      // create session token
      const payload = {
        user: {
          id: user.id,
        },
      };
      token = jwt.sign(payload, this.jwtSecret, {
        expiresIn: this.jwtSessionExpiration,
      });
    } catch (err) {
      console.error(err);
      throw new Error('Internal Server Error');
    }

    // return generated session token
    return token;
  };

  /**
   * Generates a reset token for user with given email and sends them an email
   * with a link to the password reset form.
   */
  resetPassword = async (email) => {
    // get user with email
    let user = await User.findOne({ email });
    if (!user) {
      throw new Error('User with this email does not exist.');
    }

    // create password reset token
    const payload = {
      user: {
        id: user.id,
      },
    };
    const token = jwt.sign(payload, this.jwtResetSecret, {
      expiresIn: this.jwtResetExpiration, // in seconds
    });

    // add token to user
    user.resetToken = token;
    await user.save();

    // generate email template
    const redirect = `${this.clientBaseUrl}${this.resetEmailRedirect}`;
    const defaultLink = `<h4><a href="${redirect}/${token}">Reset Password</a></h4>`;
    const defaultMessage = `
      <div style="margin: auto; width: 40%; padding: 10px">
        <h2>Password Assistance</h2>
        <p>To authenticate, please click on the Reset Password link below. It will expire in ${Math.floor(
          this.jwtResetExpiration / 60
        )} minutes.</p>
        ${defaultLink}
        <p>Do not share this link with anyone. We take your account security very seriously. We will never ask you to disclose or verify your password, OTP, credit card, or banking account number. If you receive a suspicious email with a link to update your account information, do not click on the link. Instead, notify us immediately and share the email with us for investigation.</p>
        <p>We hope to see you again soon.</p>	
      </div>`;
    const defaultSubjectLine = 'Reset Password Request';

    // send email to user
    await sendMail(
      email,
      defaultLink,
      defaultMessage,
      defaultSubjectLine,
      this.emailFromUser,
      this.emailFromPass,
      this.resetEmailHeading,
      this.resetEmailSubjectLine,
      this.emailHost,
      this.emailPort,
      this.emailSecure,
      this.resetEmailMessage
    );
  };

  /**
   * Changes a user's password to a new password.
   */
  changePassword = async ({ resetToken, newPassword }) => {
    // validate params
    if (!resetToken || !newPassword) {
      throw new Error('Authentication Error.');
    }

    // check password length
    if (newPassword.length < this.passwordLength) {
      throw new Error(
        `Password must be at least ${this.passwordLength} characters.`
      );
    }

    // find user with reset token
    let user;
    try {
      const payload = jwt.verify(resetToken, this.jwtResetSecret);
      user = await User.findOne({ _id: payload.user.id });
    } catch (err) {
      console.error(err);
      throw new Error('Token has either expired or is invalid.');
    }

    // user not found
    if (!user) {
      throw new Error('Token has either expired or is invalid.');
    }

    // encrypt password: convert text password to a hash value
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // saving hashed password to user object
    user.password = hashedPassword;
    user.resetToken = '';
    await user.save();

    return {
      msg: 'Your password has been reset. Please login with your new password.',
    };
  };
}

module.exports = LoginExpress;
