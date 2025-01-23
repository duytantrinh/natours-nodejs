const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
// const catchAsync = require('./../utils/catchAsync');

// import Factory function
const factory = require('./handlerFactory');

exports.setTourUserId = (req, res, next) => {
  //  Nested Routes)
  if (!req.body.tour) req.body.tour = req.params.tourId;

  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.createReview = catchAsync(async (req, res, next) => {
  const reviewed = await Review.findOne({
    user: { _id: req.user.id },
    tour: req.params.tourId,
  });

  if (reviewed) {
    return next(new AppError('You already given a review cho this tour', 404));
  }

  const newData = await Review.create(req.body);

  // send result to client
  res.status(201).json({
    status: 'success',
    data: {
      data: newData,
    },
  });
});

// exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
