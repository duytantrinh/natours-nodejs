const { promisify } = require('util');
const crypto = require('crypto');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  //( tạo jwt)
  const token = signToken(user._id);

  // send Cookie back
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),

    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  // Log user in, send JWT to client
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// 1.  new User

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  // send Email welcome
  const url = `${req.protocol}://${req.get('host')}/me`;

  console.log(url);

  await new Email(newUser, url).sendWelcome();

  // create token, send result to client
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. check if email and password both exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  // gọi (instance methods correctPassword tại userModel.js) để check xem password giống nhau ?
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3. If ok, send token to client
  // create token, send result to client
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'Loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Getting token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in!!! Please log in to get access.', 401)
    );
  }

  // 2. check token validation ?
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Check user still exist database ?
  const currentLoginUser = await User.findById(decoded.id);

  if (!currentLoginUser) {
    return next(
      new AppError('The user belongging to this token is no longer exist.', 401)
    );
  }

  // 4. changedPasswordAfter return true
  if (currentLoginUser.changedPasswordAfter(decoded.iat) === true) {
    return next(
      new AppError(
        'User recently changed new password! Please log in again',
        401
      )
    );
  }

  req.user = currentLoginUser;

  res.locals.user = currentLoginUser;
  next();
});

//[======= Authorization for User]
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles:['lead-guide', 'admin']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You donot have permission to perform this action', 401)
      );
    }

    next();
  };
};

//== [link get forgotPassword]
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. user post email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with this email address', 401));
  }

  // 2. random reset token
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  try {
    // 3. Send it to email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    // send email for resetPassword
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: ' Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('there was an error sending email. Try again later', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. get user based on teh token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token) // convert token
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2. check if token hasnot expired, there is a user ?  => set a new user
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 3. If ok, create token, send result to client
  createSendToken(user, 200, res);
});

//== [ updatePassword: confirm old password trước khi update new one]
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. get user from collection
  // (vì lúc này đã log in thành công nên req.user = currentLoginUser;)
  const user = await User.findById(req.user.id).select('+password');

  // 2. nhập Old PASSWORD AND CHECK
  if (!(await user.correctPassword(req.body.oldPassword, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  // 3. if so, update new password và new password Confirm
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  // save new data
  await user.save();

  // 4. Log user in, send JWT

  createSendToken(user, 200, res);
});

// (Middle ware check đã có user log in or Not ?)

exports.isLoggedIn = async (req, res, next) => {
  // 1. Check req.cookies.jwt
  if (req.cookies?.jwt !== undefined) {
    try {
      // 2. check token validation ?
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 3. Check user vẫn còn tồn tại trong database ?
      const currentLoginUser = await User.findById(decoded.id);

      // console.log(currentLoginUser);

      if (!currentLoginUser) {
        return next();
      }

      // 4. changedPasswordAfter return true
      if (currentLoginUser.changedPasswordAfter(decoded.iat) === true) {
        return next();
      }

      res.locals.user = currentLoginUser;

      return next();
    } catch (err) {
      return next();
    }
  }

  next();
};
