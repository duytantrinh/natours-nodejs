const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');

// hash password
const bcrypt = require('bcryptjs');

// 1.  Mongoose Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'user must have a name'],
    unique: true,
    trim: true,
    maxlength: [50, 'A username must have less or equal than 50 characters'],
    minlength: [2, 'A username must have more than 2 characters'],
  },
  email: {
    type: String,
    require: [true, 'please provide your email'],
    unique: true,
    lowercase: true, // convert to lowercase auto
    trim: true,
    validate: [validator.isEmail, 'please provide your email'],
    // match: [
    //   /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    //   'Please fill a valid email address',
    // ],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'please provide a password'],
    minlength: [8, 'A Password must at least 8 characters'],
    select: false, // ko show password ra OUTPUT
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please provide a passwordConfirm'],
    validate: {
      // this only works on SAVE !!!
      validator: function (el) {
        // check passswordConfirm
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },

  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,

  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangeAt = Date.now() - 1000;

  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword); // return true/false
};

userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
  if (this.passwordChangeAt) {
    const changedTimestamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );
    // console.log(JWTTimestamp, changedTimestamp);

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

//  instance method
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // set expires time
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
