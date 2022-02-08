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

const port = process.env.PORT;
//Create the server
app.listen(port, () => {
  console.log(`App Running on port 3000`);
});
