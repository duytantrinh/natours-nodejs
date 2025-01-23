const express = require('express');

const {
  getAllUsers,
  createUser,
  getUser,
  updateMe,
  uploadUserPhoto,
  resizeUserPhoto,
  updateUser,
  deleteMe,
  deleteUser,
  getMe,
} = require('./../controllers/userController');
//====== Authentication
const {
  signup,
  login,
  logout,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('./../controllers/authController');

// userRouter là 1 middleWare
const router = express.Router();

//====== Authentication
router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.use(protect);

router.patch('/updateMyPassword', updatePassword);
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);
router.get('/me', getMe, getUser);
router.delete('/deleteMe', deleteMe);

router.use(restrictTo('admin'));

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
