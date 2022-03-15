const APIFeatures = require('../utilis/apiFeatures');
const catchAsyncError = require('../utilis/catchAsyncError');
const AppError = require('../utilis/appErrorHandler');

//Global Delete Handler
exports.deleteDoc = (Model) =>
  catchAsyncError(async (req, res, next) => {
    const doc = await Model.deleteOne({ _id: req.params.id });

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
