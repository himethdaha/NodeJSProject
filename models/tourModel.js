const mongoose = require('mongoose');
const slugify = require('slugify');
//Creating a schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Name is required'],
      unique: true,
      maxLength: [40, `Tour Name Can't exceed 40 characters`],
      minLength: [10, `Tour Name must contain at least 10 characters`],
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
      enum: {
        values: ['easy', 'intermediate', 'difficult', 'dangerous', 'unknown'],
        message: `Difficulty level can only be 'easy', 'intermediate', 'difficult', 'dangerous', 'unknown'`,
      },
    },
    horrorLevel: {
      type: String,
      enum: {
        values: ['scary', 'mild scary', 'extremely scary', 'unknown'],
        message: `Horror level can only be 'scary', 'mild scary', 'extremely scary', 'unknown'`,
      },
    },
    ratingsAverage: {
      type: Number,
      min: [1.0, 'Rate between 1.0 and 5.0'],
      max: [5.0, `Rate between 1.0 and 5.0`],
      set: (val) => Math.round(val * 10) / 10,
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
    startDates: {
      type: [Date],
      validate: {
        validator: function (val) {
          val.forEach((element) => {
            return new Date(element) >= new Date();
          });
        },
        message: `Start date can't be less than today`,
      },
    },

    expeditionOrganizer: {
      type: String,
      required: [true, 'Name of organizer is required'],
    },
    expeditionGuide: {
      type: String,
      required: [true, 'Name of guide is required'],
    },
    dangers: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
      immutable: true,
    },
    //Creating an object to use geospatial data with mongodb
    tourStartLocation: {
      //sub fields of the embedded object
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      //Takes in the lat and lng
      coordinates: [Number],
      address: String,
      description: String,
    },

    //Embedding a document
    tourLocations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        description: String,
        day: Date,
      },
    ],

    //Reference to guides in the User model
    guides: [
      {
        //Type is of ObjectId
        type: mongoose.Schema.Types.ObjectId,
        //Refer to the Model
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);

//Indexes
//tourStartLocation is the center point used when searching for tours within a certain distance
//2dSphere because we're using real points in a sphere like shape
tourSchema.index({ tourStartLocation: '2dsphere' });

//Virtual populate for reviews
tourSchema.virtual('reviews', {
  //Model to be reffered
  ref: 'Review',
  //Where the id of the current models document is stored. Used to connect the child document with the parent document
  localField: '_id',
  //Field in the child document, which points to the parent document
  foreignField: 'tour',
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

//Create a Pre hook middleware
//On every find operator populate the tour/s with the guides information
tourSchema.pre(/^find/, function (next) {
  //Populate the query
  this.populate({
    path: 'guides',
    select: 'role name email',
  });
  next();
});

//Creating a model
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
