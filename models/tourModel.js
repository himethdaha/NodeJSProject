const mongoose = require('mongoose');

//Creating a schema
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A Name is required'],
    unique: true,
  },
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
  startDates: [String],
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

//Creating a model
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
