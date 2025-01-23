const express = require('express');

const {
  getAllReviews,
  setTourUserId,
  createReview,
  deleteReview,
  updateReview,
  getReview,
} = require('../controllers/reviewController');

const { protect, restrictTo } = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(protect);

// POST /tours/rueeueu5555/reviews
// POST /reviews
// GET /tours/rueeueu5555/reviews
router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourUserId, createReview);

router
  .route('/:id')
  .delete(restrictTo('user', 'admin'), deleteReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .get(getReview);

module.exports = router;
