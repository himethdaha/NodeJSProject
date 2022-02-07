//Importing the Express module
const express = require('express');
//Importing the FS module
const fs = require('fs');
const tourController = require('./controllers/tourController');
//Calling the exported express function
const app = express();
//Middleware
app.use(express.json());

//Read the test data
const tours = JSON.parse(
  fs.readFileSync('./dev-data/data/test-data.json', 'utf-8')
);

//***ROUTES***//
//Get all tours
app.get('/api/v1/tours', tourController.getTours);

//Get a tour
app.get('/api/v1/tours/:id', tourController.getTour);

//Post a tour
app.post('/api/v1/tours', tourController.postTour);

//Patch a tour
app.patch('/api/v1/tours/:id', tourController.patchTour);

//Delete a Tour
app.delete('/api/v1/tours/:id', tourController.deleteTour);
const port = 3000;
//Create the server
app.listen(port, () => {
  console.log(`App Running on port 3000`);
});
