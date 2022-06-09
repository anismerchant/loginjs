const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  verifyEmail: {
    type: Boolean,
  },
  verifyEmailToken: {
    type: String,
    default: '',
  },
  resetToken: {
    type: String,
    default: '',
  },
  auth: {
    type: String,
    default: 'USER',
  },
});

const getUserModel = (name, definition) => {
  const schema = definition
    ? new mongoose.Schema(Object.assign({}, userSchema.obj, definition))
    : userSchema;

  return mongoose.model(name, schema);
};

module.exports = getUserModel;
