const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, `Enter your name`],
    maxLength: [20, `Name can't exceed 20 characters`],
    trim: true,
    validate: {
      validator: function (val) {
        return validator.isAlpha(val, ['en-US'], { ignore: ' ' });
      },
      message: `Name can only contain letters`,
    },
  },
  nickName: {
    type: String,
    maxLength: [10, `Nick name can't exceed 10 characters`],
    trim: true,
  },
  email: {
    type: String,
    required: [true, `Enter your email`],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: `{VALUE} is not a valid email`,
    },
  },
  isVIP: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: [true, `Enter a password`],
    validate: {
      validator: function (val) {
        return validator.isStrongPassword(val);
      },
      message: `Password must be at least 8 characters long and contain one 'a-z', 'A-Z', one number and symbol`,
    },
  },
  passwordConfirmation: {
    type: String,
    required: [true, `Enter password confirmation`],
    //Only works on save or create
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: `Passwords confirmation doesn't match`,
    },
  },
});

//Document Middleware to encrypt a password
userSchema.pre('save', async function (next) {
  //If the password isn't modified immediately exit this middleware
  if (!this.isModified('password')) return next();

  //Hash the password with a salt length of 12
  this.password = await bcrypt.hash(this.password, 12);

  //Do not persist the passwordConfirmation field to the database after validating the password
  this.passwordConfirmation = undefined;

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
