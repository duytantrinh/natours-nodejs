const express = require('express');

const { protect, restrictTo } = require('./../controllers/authController');

// import http request function
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTop5CheapestTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages,
  // checkID,
  // checkBody, // checkBody: check if body contain name,price properties
} = require('../controllers/tourController');

const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

// (Nested Routes for all Reviews)
// POST /tours/rueeueu5555/reviews
// GET /tours/rueeueu5555/reviews
router.use('/:tourId/reviews', reviewRouter);

// [Query routes]
router.route('/top-5-cheapest').get(aliasTop5CheapestTours, getAllTours);

// route for Statistics
router.route('/tour-stats').get(getTourStats);

router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);
// /tours-within?distance=11&center=-11,12&unit=mi
// /tours-within/11/center/-11,12/unit/mi

router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )

  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
