const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');

// 1.  Mongoose Schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'tour must have a name'],

      unique: true,
      trim: true,
      maxlength: [50, 'A tour name must have less or equal than 50 characters'],
      minlength: [5, 'A tour name must have more than 5 characters'],
      // validate: [validator.isAlpha, 'TOur name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'tour must have a durations'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: '{VALUE} is not supported',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // 4.666 => 46.666 => 47 / 10 = 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      // (tạo Own validation priceDiscount phải < price)
      // validate ko thực hiện đc với lệnh update
      validate: {
        validator: function (val) {
          return val < this.price; // `this only works for current data/ new data`
        },

        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summay'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String], // an array of String
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },

    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], // longtitude,latitude
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number], // longtitude,latitude
        address: String,
        description: String,
        day: Number,
      },
    ],

    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: {
      virtuals: true,
      toObject: true,
    },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });

tourSchema.index({ slug: 1 });

// index cho $geoWithin
tourSchema.index({ startLocation: '2dsphere' });

//  `Virtual Properties`
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// [-- Virtual Populate)]

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  // this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  // this chỉ current query
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangeAt',
  });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
