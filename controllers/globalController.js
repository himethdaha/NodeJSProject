const APIFeatures = require('../utilis/apiFeatures');
const catchAsyncError = require('../utilis/catchAsyncError');
const AppError = require('../utilis/appErrorHandler');

//Global Delete Handler
exports.deleteDoc = (Model) =>
  catchAsyncError(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    //If a document is not found with the id
    if (!doc) {
      return next(new AppError(`Could not find a document with that ID`, 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

//Global Update handler
exports.updateDoc = (Model) =>
  catchAsyncError(async (req, res, next) => {
    //Prohibiting certain fields from being updated
    Object.keys(req.body).forEach((element) => {
      if (element === 'ratingsAverage' || element === 'ratingsQuantity') {
        return next(new AppError(`Can't update these fields`));
      }
    });
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    //If a doc is not found with the id
    if (!doc) {
      return next(new AppError(`Could not find a document with that ID`, 404));
    }
    res.status(200).json({
      status: 'Success',
      data: {
        doc: doc,
      },
    });
  });

//Global Get Document handler
exports.getDoc = (Model, populateOptions) =>
  catchAsyncError(async (req, res, next) => {
    //Create query field
    let query = await Model.findById(req.params.id);
    //If populateOptions isn't null. populate the query
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const doc = await query;

    //If a tour is not found with the id
    //Null means falsy in JS
    if (!doc) {
      return next(new AppError(`Could not find a document with that ID`, 404));
    }

    return res.status(200).json({
      status: 'Success',
      doc: doc,
    });
  });

//Global Get Documents
exports.getDocs = (Model, id) =>
  catchAsyncError(async (req, res, next) => {
    //Create an instance of the APIFeatures class
    const features = new APIFeatures(Model, req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    //Grab the document which matches all of the options in the query
    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        docs: docs,
      },
    });
  });
