const express = require('express');

const {
  getCheckoutSession,
  createBooking,
  deleteBooking,
  updateBooking,
  getAllBookings,
  getBooking,
} = require('../controllers/bookingController');

const { restrictTo, protect } = require('./../controllers/authController');

const router = express.Router();

router.use(protect);

// for checkout with Stripe
router.get('/checkout-session/:tourId', getCheckoutSession);

router.use(restrictTo('admin'));

router.route('/').get(getAllBookings).post(createBooking);
router.route('/:id').delete(deleteBooking).patch(updateBooking).get(getBooking);

module.exports = router;
