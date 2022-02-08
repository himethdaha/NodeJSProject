//THIS IS WHERE THE SETUP OF MY APPLICATION HAPPENS
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

//Get the database string to connect the app with atlas
const DbString = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

//Conenct to the database using mongoose
//connect returns a promise which is a connection object
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

//Creating a test document
const newTour = new Tour({
  name: 'The Test Hiker',
  price: 500,
  rating: 4.3,
});

//Save the new Document
newTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => console.log(err));
const port = process.env.PORT;
//Create the server
app.listen(port, () => {
  console.log(`App Running on port 3000`);
});
