const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, `Enter your name`],
    maxLength: [20, `Name can't exceed 20 characters`],
    trim: true,
    validate: {
      validator: function (val) {
        return validator.isAlpha(val, ['en-us'], { ignore: ' ' });
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
  isVIP: Boolean,
  password: {
    type: String,
    required: [true, `Enter a password`],
    validate: {
      validator: validator.isStrongPassword({
        minLength: 9,
        minNumbers: 2,
        minSymbols: 2,
      }),
      message: `Password must be at least 9 characters long with at least 2 numbers and symbols`,
    },
  },
  passwordConfirmation: {
    type: String,
    required: [true, `Enter password confirmation`],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: `Passwords confirmation doesn't match`,
    },
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
