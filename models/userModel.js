const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
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
      select: false,
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
    passwordChangedTime: Date,
    role: {
      type: String,
      enum: ['user', 'admin', 'expeditionOrganizer', 'expeditionGuide'],
    },
    passwordResetToken: String,
    passwordResetTokenExp: Date,
    activeUser: {
      type: String,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);

/////MIDDLEWARES/////
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

//Document middleware to update passwordChangedTime when the password is modifiled
userSchema.pre('save', function (next) {
  //Return next middleware if the password isn't modified or is new
  if (!this.isModified || this.isNew) {
    return next();
  }

  this.passwordChangedTime = Date.now();
  next();
});

//Query middleware to exclude all deactivated users from find methods
userSchema.pre(/^find/, function (next) {
  this.find({ activeUser: { $ne: false } });
  next();
});

/////INSTANCE METHODS/////
//Instance method to compare user provided password and password from the database when logging in
userSchema.methods.comparePasswords = async function (
  userInputPass,
  databasePass
) {
  return await bcrypt.compare(userInputPass, databasePass);
};

//Instance method to compare password changed time and jwt issued time
userSchema.methods.isPasswordChanged = function (jwtIat) {
  //Check if the passwordChangedTime is present in the user document
  if (this.passwordChangedTime) {
    //Change the password changed time from the Date format to a TimeStamp
    const convertPassChangeTime = this.passwordChangedTime.getTime() / 1000;

    //Return true if the passwordChangedTime is greater than JwtIat
    return convertPassChangeTime > jwtIat;
  }
  //Return false if the user hasn't changed the password
  return false;
};

//Instance method to create the password reset token
userSchema.methods.forgotPasswordReset = function () {
  //Create a 32 bit hex string
  const token = crypto.randomBytes(32).toString('hex');

  //Hash the password reset token, which is to be saved in the database as a temp password for the user to use, to create a new password
  this.passwordResetToken = crypto.Hash('sha256').update(token).digest('hex');

  //Set the expiration time of the password reset token (10 mins)
  this.passwordResetTokenExp = new Date().setMinutes(10);

  //Return the 32 bit hex string for the user to use
  return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
