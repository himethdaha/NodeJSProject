const mongoose = require('mongoose');

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
//Populate the review with the tour and user
reviewSchema.pre(/^find/, function (next) {
  //populate the user
  this.populate({
    path: 'user',
    select: 'name nickName',
  });
  next();
});
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
