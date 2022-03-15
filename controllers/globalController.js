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
