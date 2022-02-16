const mongoose = require('mongoose');
const slugify = require('slugify');

//Creating a schema
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A Name is required'],
    unique: true,
  },
  slug: String,
  VIPTour: { type: Boolean, default: false },
  duration: {
    type: Number,
    required: [true, 'A duration is required'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A group must have at least 1 person'],
  },
  difficulty: {
    type: String,
    required: [true, 'A difficulty level is required'],
  },
  ratingsAverage: {
    type: Number,
  },
  ratingsQuantity: {
    type: Number,
  },
  price: {
    type: Number,
    required: [true, 'A price is required'],
  },
  summary: {
    type: String,
    required: [true, 'A summary is required'],
  },
  description: {
    type: String,
    required: [true, 'At least a 100 word description is required'],
  },
  imageCover: {
    type: String,
    required: [true, 'An image cover is required'],
  },
  images: [String],
  startDates: [Date],
  expeditionOrganizer: {
    type: String,
    required: [true, 'Name of organizer is required'],
  },
  expeditionGuide: {
    type: String,
    required: [true, 'Name of guide is required'],
  },
  Dangers: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
});

//Mongoose Document Middleware
//Pre middleware on save
tourSchema.pre('save', function (next) {
  //Create a slug
  this.slug = slugify(this.name, { lower: true, locale: 'en', trim: true });
  next();
});

//Mongoose Query Middleware
tourSchema.pre(/^find/, function (next) {
  //Exclude the vip tours from all find operations
  this.find({ VIPTour: { $ne: true } });
  next();
});

//Creating a model
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
