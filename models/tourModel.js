const mongoose = require('mongoose');

//Creating a schema
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A Name is required'],
    unique: true,
  },
  price: {
    type: Number,
    required: [true, 'A Price is required'],
  },
  rating: {
    type: Number,
    default: 4.0,
  },
});

//Creating a model
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
