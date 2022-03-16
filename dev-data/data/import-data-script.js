//Script to import test JSON data to the database
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

//Get the config variables
dotenv.config({ path: './config.env' });

//Read the data from the file
const data = JSON.parse(fs.readFileSync('./dev-data/data/tours.json', 'utf-8'));
const dataU = JSON.parse(
  fs.readFileSync('./dev-data/data/users.json', 'utf-8')
);
const dataR = JSON.parse(
  fs.readFileSync('./dev-data/data/reviews.json', 'utf-8')
);

//Create the db string
const DbString = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

//Connect to the database
mongoose
  .connect(DbString, {
    //To deal with deprecation warnings
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((conn) => {
    console.log('Connected to the db');
  });

//Post all the test data to the database
const importData = async () => {
  try {
    await Tour.create(data);
    await User.create(dataU, { validateBeforeSave: false });
    await Review.create(dataR);
    console.log('Data Imported Successfully');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

//Method to delete the data
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Deleted successfully');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

//Run import if the 3rd command is '--import' in the cmd when using process.argv
if (process.argv[2] === '--import') {
  importData();
}
//Run delete if the 3rd command is '--import' in the cmd when using process.argv
if (process.argv[2] === '--delete') {
  deleteData();
}
