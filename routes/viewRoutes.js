const express = require('express');
const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  getMyTours,
  updateUserData,
} = require('../controllers/viewController');

const { protect, isLoggedIn } = require('../controllers/authController');

const { createBookingCheckout } = require('../controllers/bookingController');

const router = express.Router();

//render file views/base.pug
router.get('/', createBookingCheckout, isLoggedIn, getOverview);

router.get('/tour/:slug', isLoggedIn, getTour);

router.get('/login', isLoggedIn, getLoginForm);

router.get('/me', protect, getAccount);

// all bookings of current User
router.get('/my-tours', protect, getMyTours);

// for submitting USer Account Settings form cach 1
router.post('/submit-user-data', protect, updateUserData);

module.exports = router;
