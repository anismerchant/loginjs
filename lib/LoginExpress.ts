import gravatar from 'gravatar';
import bcrypt from 'bcryptjs';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import connectDB from './config/db';
import sendMail from './helper/sendMail';
import User from './models/User';
import { Response, NextFunction } from 'express';
import {
  AuthRequest,
  ChangePasswordBody,
  LoginBody,
  LoginExpressConfig,
  RegisterBody,
} from './types';

/**
 * Authentication Manager class.
 */
class LoginExpress {
  private config: LoginExpressConfig = {
    jwtSecret: '',
    jwtResetSecret: '',
    emailFromUser: '',
    emailFromPass: '',
    emailHost: '',
    mongoDbUri: '',
    clientBaseUrl: '',
    emailPort: 465,
    emailSecure: true,
    verifyEmailHeading: '',
    verifyEmailSubjectLine: '',
    verifyEmailMessage: '',
    verifyEmailRedirect: '/verify-email',
    resetEmailHeading: '',
    resetEmailSubjectLine: '',
    resetEmailMessage: '',
    resetEmailRedirect: '/reset-password',
    passwordLength: 8,
    jwtSessionExpiration: 7200,
    jwtResetExpiration: 900,
  };
  /**
   * Validate config object, initialize variables and connect to database.
   */
  constructor(config: LoginExpressConfig) {
    // validate config
    if (
      !config.jwtSecret ||
      !config.jwtResetSecret ||
      !config.emailFromUser ||
      !config.emailFromPass ||
      !config.emailHost ||
      !config.mongoDbUri ||
      !config.clientBaseUrl
    ) {
      throw new Error(
        'Missing required config. Make sure you have the following in your config object: jwtSecret, jwtResetSecret, emailFromUser, emailFromPass, emailHost, mongoDbUri, clientBaseUrl'
      );
    }
    if (config.passwordLength && config.passwordLength < 0) {
      throw new Error(
        '"passwordLength" must be a positive integer (ie. greater than 0).'
      );
    }
    if (config.jwtSessionExpiration && config.jwtSessionExpiration < 0) {
      throw new Error('"jwtSessionExpiration" must be positive integers.');
    }

    // assign class variables
    this.config = { ...this.config, ...config };

    // connect to database
    connectDB(config.mongoDbUri);
  }

  /**
   * Express middleware. Validates user and adds user to req object.
   */
  isLoggedIn = async (req: AuthRequest, res: Response, next: NextFunction) => {
    // check if cookies exist
    const cookies = req.headers.cookie;
    if (!cookies) {
      res.status(401).send('Authentication failed.');
      return;
    }

    // check for cookie named 'session'
    let user;
    for (let cookie of cookies.split(';')) {
      const cookieSplit = cookie.split('=');
      if (cookieSplit.length == 2) {
        const name = cookieSplit[0].trim();
        const value = cookieSplit[1].trim();
        if (name && value && name === 'session') {
          // get user from database based on user id in jwt token
          try {
            const payload = verify(value, this.config.jwtSecret) as JwtPayload;
            if (!payload) throw new Error('Invalid JWT payload.');
            user = await this.getUser(payload.user.id);
          } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
          }
        }
      }
    }

    // user does not exist
    if (!user) {
      res.status(401).send('Authentication failed.');
      return;
    }

    // assign user to req object
    req.user = user;
    next();
  };

  /**
   * Returns a user based on user id.
   * Sensitive fields are omitted such as passwords and tokens.
   */
  getUser = async (id: string) => {
    return await User.findById(id).select(
      '-password -verifyEmailToken -resetToken'
    );
  };

  /**
   * Registers a user with given name, email and password.
   */
  register = async ({ name, email, password }: RegisterBody) => {
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
      const token = sign(payload, this.config.jwtSecret, {
        expiresIn: this.config.jwtSessionExpiration, // in seconds
      });

      // update user with verification token
      user.verifyEmail = false;
      user.verifyEmailToken = token;

      // save user object in mongodb
      await user.save();

      // create email template
      const redirect = `${this.config.clientBaseUrl}${this.config.verifyEmailRedirect}`;
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
        this.config.emailFromUser,
        this.config.emailFromPass,
        this.config.verifyEmailHeading,
        this.config.verifyEmailSubjectLine,
        this.config.emailHost,
        this.config.emailPort,
        this.config.emailSecure,
        this.config.verifyEmailMessage
      );
    } catch (err) {
      console.error(err);
      throw new Error('Registration failed.');
    }
  };

  /**
   * Verifies user with given verification token.
   */
  verify = async (token: string) => {
    // token is missing
    if (!token) {
      throw new Error('Authentication Error.');
    }

    // get user from token
    let user;
    try {
      const payload = verify(token, this.config.jwtSecret) as JwtPayload;
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
  login = async ({ res, email, password }: LoginBody) => {
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
      const token = sign(payload, this.config.jwtSecret, {
        expiresIn: this.config.jwtSessionExpiration,
      });

      // set token as session cookie on res object
      res.cookie('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production',
        maxAge: this.config.jwtSessionExpiration! * 1000,
      });
    } catch (err) {
      console.error(err);
      throw new Error('Internal Server Error');
    }
  };

  /**
   * Generates a reset token for user with given email and sends them an email
   * with a link to the password reset form.
   */
  resetPassword = async (email: string) => {
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
    const token = sign(payload, this.config.jwtResetSecret, {
      expiresIn: this.config.jwtResetExpiration, // in seconds
    });

    // add token to user
    user.resetToken = token;
    await user.save();

    // generate email template
    const redirect = `${this.config.clientBaseUrl}${this.config.resetEmailRedirect}`;
    const defaultLink = `<h4><a href="${redirect}/${token}">Reset Password</a></h4>`;
    const defaultMessage = `
      <div style="margin: auto; width: 40%; padding: 10px">
        <h2>Password Assistance</h2>
        <p>To authenticate, please click on the Reset Password link below. It will expire in ${Math.floor(
          this.config.jwtResetExpiration! / 60
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
      this.config.emailFromUser,
      this.config.emailFromPass,
      this.config.resetEmailHeading,
      this.config.resetEmailSubjectLine,
      this.config.emailHost,
      this.config.emailPort,
      this.config.emailSecure,
      this.config.resetEmailMessage
    );
  };

  /**
   * Changes a user's password to a new password.
   */
  changePassword = async ({ resetToken, newPassword }: ChangePasswordBody) => {
    // validate params
    if (!resetToken || !newPassword) {
      throw new Error('Authentication Error.');
    }

    // check password length
    if (newPassword.length < this.config.passwordLength!) {
      throw new Error(
        `Password must be at least ${this.config.passwordLength} characters.`
      );
    }

    // find user with reset token
    let user;
    try {
      const payload = verify(
        resetToken,
        this.config.jwtResetSecret
      ) as JwtPayload;
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
