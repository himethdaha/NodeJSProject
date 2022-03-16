const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, `Please write a review`],
      maxLength: [200, `Can't exceed 200 characters`],
    },
    rating: {
      type: Number,
      min: [0.0, `Can't rate below 0`],
      max: [5.0, `Can't rate above 5`],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      immutable: true,
    },
    //Parent referencing tour and user. Because child referencing will create massive arrays in the parents
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, `Enter tour Id`],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, `Enter user Id`],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);

//Query Middleware
//Populate the review with the user
reviewSchema.pre(/^find/, function (next) {
  //populate the user
  this.populate({
    path: 'user',
    select: 'name nickName',
  });
  next();
});

//Calculating ratingsquantity and average in tours
//Storing a summary of a related dataset on the main dataset
//Main reason for this method to be static is becuase we're using aggregation here, which is always called on the Model
reviewSchema.statics.calcRatings = async function (tourId) {
  //Save the aggregation promise
  const aggrPromise = await this.aggregate([
    {
      //Get the tour matching the review
      $match: {
        tour: tourId,
      },
    },
    {
      $group: {
        _id: '$tour',
        //Number of ratings
        //Add one for each matching tour found with the review
        totRatings: { $sum: 1 },
        //Get the average rating by selecting the rating field in the Review Model
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  //Above aggregate returns an array with an object.
  //Update the tour with the object returned

  //If there are no ratings, leave the fields at 0
  if (totRatings < 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: aggrPromise[0].avgRating,
    ratingsQuantity: aggrPromise[0].totRatings,
  });
};

//Post middleware to get the ratings average and quantity
reviewSchema.post('save', async function () {
  //this refferes to the current review document
  await this.constructor.calcRatings(this.tour);
});
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
