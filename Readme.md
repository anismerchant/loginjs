# Login.js

Minimalist module built to set up a secure back-end express login system in record speed. Login.js seemlessly adds to your existing express server and sets up secure login routes.

## Installation

Before installing, [download and install Node.js](https://nodejs.org/en/download/).

For brand new projects, be sure to create a `package.json` first with the [`npm init` command](https://docs.npmjs.com/creating-a-package-json-file).

Next, run the following command in your terminal:

```bash
npm i login-express
```

### Dependencies

This package is meant to be used in Node.js with Express. If you already haven't done so, install Express in your project:

```
npm i express
```

This package also uses Mongoose to create ORMs for a MongoDB instance. However, you do not need to install the package yourself.

## Quick Setup

Create an `index.js` file, and paste the starter code as shown below. It assumes you've using Express.js.

   ```js
   const express = require('express');
   const app = express();
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
     emailSecure: process.env.EMAIL_SECURE
   };

   loginJS(dbConfig, appConfig, app, express);
   ```

   These are **optional** should you need to change default values included in Login.js. If so, please add the following to your `index.js`:

   ```js
   // optional
   dbConfig.passwordLength = parseInt(process.env.ACCOUNT_PWD_LENGTH); // positive integer
   dbConfig.jwtSessionExpiration = parseInt(process.env.JWT_SESSION_EXPIRATION); // in seconds
   appConfig.jwtResetExpiration = parseInt(process.env.JWT_RESET_EXPIRATION); // in seconds

   // optional (3rd parameter)
   let verifyEmailConfig = {
     emailHeading: 'Your Company Name',
     emailSubjectLine: 'Verify Password',
     emailMessage: 'Custom verify password message goes here. Verify link is auto-generated.',
   };

   // Optional (4th parameter)
   let resetEmailConfig = {
     emailHeading: 'Your Company Name',
     emailSubjectLine: 'Reset Password',
     emailMessage: 'Custom reset password message goes here. Reset link is auto-generated.',
   };

   // With custom verify email and reset email
   loginJS(dbConfig, appConfig, app, express, verifyEmailConfig, resetEmailConfig);

   // With only custom verify email
   loginJS(dbConfig, appConfig, app, express, verifyEmailConfig);

   // With only custom reset email
   loginJS(dbConfig, appConfig, app, express, verifyEmailConfig={}, resetEmailConfig);
   ```

Create a `.env` file to store a list of environmental variables needed for this module to run.

These are **required**:

   ```js
   // replace mock credentials with your own

   MONGODB_URI=mongodb+srv://jdoe:password@cluster0.d312b.mongodb.net/loginjs?retryWrites=true&w=majority
   JWT_SECRET=xyzjwtsec3874r3t
   JWT_RESET_SECRET=mtcjreset56874sec56rt
   EMAIL_FROM_USER=support@loginjs.com
   EMAIL_FROM_PASS=hky34KTcyTyz18
   EMAIL_HOST=smtp.zoho.com
   EMAIL_PORT=465
   EMAIL_SECURE=true
   ```

   These are **optional**:

   ```js
   JWT_SESSION_EXPIRATION = 3600; // default value inside Login.js module set 7200 (seconds)
   JWT_RESET_EXPIRATION = 600; // default value inside Login.js module set to 900 (seconds)
   ACCOUNT_PWD_LENGTH = 10; // default value inside Login.js module set to 8
   ```

### Setup Example

```js
const express = require('express');
const app = express();
const loginJS = require('login-express');

const dbConfig = {
  mongodbURI: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
};

const appConfig = {
  jwtResetSecret: process.env.JWT_RESET_SECRET,
  emailFromUser: process.env.EMAIL_FROM_USER,
  emailFromPass: process.env.EMAIL_FROM_PASS,
  emailHost: process.env.EMAIL_HOST,
  emailPort: process.env.EMAIL_PORT,
  emailSecure: process.env.EMAIL_SECURE,
  basePath: '/auth' // defaults to '/api'
};

loginJS(dbConfig, appConfig, app, express);

app.listen(5000, () => console.log('Server started on port 5000'));
```

## Class-Based Login Manager

The default `loginJS` function automatically creates routes and user schemas for you. If you need more fine-tuned control over your Express server, then use the `LoginExpress` class instead:

```js
const express = require('express')
const mongoose = require('mongoose')
const { LoginExpress } = require('login-express')

// initialize express
const app = express()

// initialize db
mongoose.connect(process.env.MONGODB_URI)
const accountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '' },
    verifyEmail: { type: Boolean, default: false },
    verifyEmailToken: { type: String, default: '' },
    resetToken: { type: String, default: '' },
    auth: { type: String, default: 'USER' },
  }
)
const accountModel = mongoose.model('account', accountSchema)

// intialize login-express
const loginJS = new LoginExpress({
  jwtSecret: process.env.JWT_SECRET,
  jwtResetSecret: process.env.JWT_RESET_SECRET,
  emailFromUser: process.env.EMAIL_USER,
  emailFromPass: process.env.EMAIL_PASS,
  emailHost: process.env.EMAIL_HOST,
  userModel: accountModel,
  clientBaseUrl: 'http://localhost:3000',
})

// create express router
const router = express.Router()

// get user
router.get('/user', loginJS.isLoggedIn, (req, res) => {
  res.status(200).send(req.user)
})

// register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  try {
    await loginJS.register(
      res, 
      {
         name,
         email,
         password,
         customFieldOne: 'hello world',
         customFieldTwo: 42
      }
    )
    res.status(200).end()
  } catch (err) {
    res.status(400).send(err.message)
  }
})

// login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    await loginJS.login(res, { email, password })
    res.status(200).end()
  } catch (err) {
    res.status(400).send(err.message)
  }
})

// send verification email
router.post(
  '/send-verify-email',
  loginJS.isLoggedIn,
  async (req, res) => {
    try {
      await loginJS.sendVerificationEmail(req.user)
      res.status(200).end()
    } catch (err) {
      res.status(400).send(err.message)
    }
  }
)

// verify email
router.patch('/verify-email', async (req, res) => {
  const { token } = req.body
  try {
    await loginJS.verify(token)
    res.status(200).end()
  } catch (err) {
    res.status(400).send(err.message)
  }
})

// request password change
router.post('/send-reset-password', async (req, res) => {
  const { email } = req.body
  try {
    await loginJS.sendPasswordResetEmail(email)
    res.status(200).end()
  } catch (err) {
    res.status(400).send(err.message)
  }
})

// change password
router.patch('/reset-password', async (req, res) => {
  const { resetToken, newPassword } = req.body
  try {
    await loginJS.changePassword({ resetToken, newPassword })
    res.status(200).end()
  } catch (err) {
    res.status(400).send(err.message)
  }
})

// all routes have a /auth path prefix
app.use('/auth', router)

// run express server
app.listen(5000, () => console.log('Server started on port 5000'))
```

## Features

- Client sign up and sign In

- Client gravatar

- Encrypted password storage in MongoDB

- Client authentication and reset password

- Client email verification

- Reset password email sent to the client

- Verify email sent to the client

## MongoDB Setup

Login.js integrates with MongoDB. Before running the Login.js module, be sure to launch a MongoDB server and provide its URI as an environment variable in `.env` file (discussed above).

Alternatively, I recommend setting up a [MongoDB Cloud Cluster.](https://www.mongodb.com/cloud)

## Security Issues

If you discover a security vulnerability or would like to help me improve Login.js, please email me. Alternatively, submit a pull request at this project's Github, and we'll go from there. Thank you for your support.

## API Endpoints

To test these endpoints, I would highly recommend using Postman as per illustrations and other details below.

Register Client

   ```text
   POST: /api/register
   ```

Get Authorized Client

   ```text
   GET: /api/login
   ```

Sign In Client

   ```text
   POST: /api/login
   ```

Verify Email Address

   ```text
   PATCH: /api/verify-email
   ```

Forgot Password

   ```text
   PUT: /api/forgot-password
   ```

Reset Password

   ```text
   PATCH: /api/reset-password
   ```

## req and res Objects

Register Client

```js
// a 'verify your email address' link, which contains the 'verifyEmailToken' in the URL, is sent via email to the client

// req object (sent from client to server)

req.body = {
   name,
   email,
   password
}
```

```js
// res object (returned to client from server)

res.json({
   token
})
```

Get Authorized Client

```js
// token (from above) sent back to the server via http headers for client authorization and access to private routes

axios.defaults.headers.common['x-auth-token'] = token;
```

Sign In Client

```js
// if the client's email address remains unverified, a 'verify your email address' link, which contains the 'verifyEmailToken' in the URL, is sent via email to the client

// req object (sent from client to server)

req.body = {
   name,
   email,
   password
}
```

```js
// res object (returned to client from server)

res.json({
   token
})
```

Verify Email

```js
// note: 'verifyEmailToken' inside req.body directly below is from the email to the client (see comments above), and it's the same token as above

// req object (sent from client to server)

req.body = {
   verifyEmailToken,
   newPassword
}

// res object (returned to client from server)

res.json({
   msg
})
```

Forgot Password

```js
// req object (sent from client to server)

req.body = {
   email
}
```

```js
// a reset-password link, which contains the 'resetToken' in the URL, is sent via email to the client

// res object (returned to client from server)

res.json({
   msg
})
```

Reset Password

```js
// note: 'resetToken' inside req.body below is from the email to client (see comment above)

// req object (sent from client to server)

req.body = {
   resetToken,
   newPassword
}

// res object (returned to client from server)

res.json({
   msg
})
```

## Testing Endpoints in Postman (illustrations)

Register Client

```text
Shows the req object with the client's name, email, and password sent to the server, and it shows the res object returned with the token.
```

![register-client](https://user-images.githubusercontent.com/5770541/97674924-bcb59280-1a64-11eb-98b7-b81d9748d2bd.png)

Get Authorized Client Information

```text
Shows x-auth-token and its value set in the headers, and it shows the res object returned with the client details.
```

![get-auth-client](https://user-images.githubusercontent.com/5770541/97674969-cf2fcc00-1a64-11eb-9458-14c139998a37.png)

Sign In Client

```text
Shows the req object sent with the client email and password to the server, and it shows the res object returned with the token.
```

![signin-client](https://user-images.githubusercontent.com/5770541/97674986-d48d1680-1a64-11eb-923f-7e4e99ecf4b2.png)

Verify Email Address

```text
Shows the req object sent with the 'verifyEmailToken' to the server, and it shows the res object returned with a msg to the client.
```

![verify-email](https://user-images.githubusercontent.com/5770541/97675005-db1b8e00-1a64-11eb-8caa-b7247895ac5b.png)

Forgot Password

```text
Shows the req object sent with the client email to the server, and it shows the res object returned with a msg to the client.
```

![forgot-password](https://user-images.githubusercontent.com/5770541/97675034-ebcc0400-1a64-11eb-8e79-f61305b88bc8.png)

Reset Password

```text
Shows the req object sent with the 'resetToken' and client's 'newPassword' to the server, and it shows the res object returned with a msg to the client.
```

![reset-password](https://user-images.githubusercontent.com/5770541/97675039-ed95c780-1a64-11eb-80dd-4e7e8dcc9f53.png)

Reset Password Email Sent to Client

![reset-email](https://user-images.githubusercontent.com/5770541/97639557-32920d80-1a15-11eb-8c01-36f8cc9f6715.png)

Verification Email Sent to Client

![verify-your-email](https://user-images.githubusercontent.com/5770541/97639629-55bcbd00-1a15-11eb-82f6-5e22eca8c6d7.png)
