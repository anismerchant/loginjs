# Login.js

Minimalist module built to set up a secure back-end express login system in record speed.

## Installation

Before installing, [download and install Node.js](https://nodejs.org/en/download/).

For brand new projects, be sure to create a `package.json` first with the [`npm init` command](https://docs.npmjs.com/creating-a-package-json-file).

Next, run the following command in your terminal:

```bash
npm i login-express
```

## Quick Setup

Create an `index.js` file, and paste the starter code shown below inside of it.

   ```js
   const loginJS = require('login-express');

   // required
   const loginConfig = {
   mongodbURI: process.env.MONGODB_URI,
   jwtSecret: process.env.JWT_SECRET,
   };

   // required
   const resetConfig = {
   jwtResetSecret: process.env.JWT_RESET_SECRET,
   emailFromUser: process.env.EMAIL_FROM_USER,
   emailFromPass: process.env.EMAIL_FROM_PASS,
   emailHost: process.env.EMAIL_HOST,
   emailPort: process.env.EMAIL_PORT,
   emailSecure: process.env.EMAIL_SECURE,
   };

   // required
   const verifyEmailConfig = {
   emailFromUser: process.env.EMAIL_FROM_USER,
   emailFromPass: process.env.EMAIL_FROM_PASS,
   emailHost: process.env.EMAIL_HOST,
   emailPort: process.env.EMAIL_PORT,
   emailSecure: process.env.EMAIL_SECURE,
   }

   // Insert optional customization here if you need it (see below).

  loginJS(loginConfig, resetConfig, verifyEmailConfig);
   ```

   These are **optional** should you need to change default values included in Login.js. If so, please add the following to your `index.js`:

   ```js
   // optional
   resetConfig.jwtResetExpiration = parseInt(process.env.JWT_RESET_EXPIRATION); // in seconds
   resetConfig.emailHeading = 'Your Custom Heading';
   resetConfig.emailSubjectLine = 'Your Custom Subject Line';
   resetConfig.emailMessage ='Your custom reset password message goes here. Reset password link will be generated and placed below your custom message.';

   // optional
   loginConfig.passwordLength = parseInt(process.env.ACCOUNT_PWD_LENGTH); // positive integer
   loginConfig.jwtSessionExpiration = parseInt(
   process.env.JWT_SESSION_EXPIRATION
   ); // in seconds

   // optional
   verifyEmailConfig.emailHeading = 'Your Custom Heading';
   verifyEmailConfig.emailSubjectLine = 'Your Custom Subject Line';
   verifyEmailConfig.emailMessage = 'Your custom verify email message goes here. Verify email link will be generated and placed below your custom message.';
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

## Stand-alone Login System Quick Setup

If you prefer quick access to only the login functionality without the reset password feature, then the setup is as follows:

Create an `index.js` file, and paste the starter code shown below inside of it.

   ```js
   const loginJS = require('login-express');
   const createLogin = loginJS.createLogin;

   // required
   const loginConfig = {
   mongodbURI: process.env.MONGODB_URI,
   jwtSecret: process.env.JWT_SECRET,
   };

   // required
   const verifyEmailConfig = {
   emailFromUser: process.env.EMAIL_FROM_USER,
   emailFromPass: process.env.EMAIL_FROM_PASS,
   emailHost: process.env.EMAIL_HOST,
   emailPort: process.env.EMAIL_PORT,
   emailSecure: process.env.EMAIL_SECURE,
   }

   // Insert optional customization here if you need it (see below).

   // Login system without reset password feature
   createLogin(loginConfig, verifyEmailConfig, launchApp = true);
   ```

   These are **optional** should you need to change default values included in Login.js. If so, please add the following to your `index.js`:

   ```js
   loginConfig.passwordLength = parseInt(process.env.ACCOUNT_PWD_LENGTH); // positive integer
   loginConfig.jwtSessionExpiration = parseInt(
   process.env.JWT_SESSION_EXPIRATION
   ); // in seconds
   ```

   ```js
   verifyEmailConfig.emailHeading = 'Your Custom Heading';
   verifyEmailConfig.emailSubjectLine = 'Your Custom Subject Line';
   verifyEmailConfig.emailMessage = 'Your custom verify email message goes here. Verify email link will be generated and placed below your custom message.';
   ```

Create a `.env` file to store a list of environmental variables needed for this module to run.

These are **required**:

```js
// replace mock credentials with your own

MONGODB_URI=mongodb+srv://jdoe:password@cluster0.d312b.mongodb.net/loginjs?retryWrites=true&w=majority
JWT_SECRET=xyzjwtsec3874r3t
EMAIL_FROM_USER=support@loginjs.com
EMAIL_FROM_PASS=hky34KTcyTyz18
EMAIL_HOST=smtp.zoho.com
EMAIL_PORT=465
EMAIL_SECURE=true
```

These are **optional**:

```js
JWT_SESSION_EXPIRATION = 3600; // default value inside Login.js module set to 7200 (seconds)
ACCOUNT_PWD_LENGTH = 10; // default value inside Login.js module set to 8
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
