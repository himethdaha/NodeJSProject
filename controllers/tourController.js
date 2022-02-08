//Importing the Express module
const express = require('express');
//Importing the FS module
const fs = require('fs');

//Read the test data

const tours = JSON.parse(
  fs.readFileSync('./dev-data/data/test-data.json', 'utf-8')
);

//Callback functions for the Routes
exports.getTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};
exports.getTour = (req, res) => {
  //Get the id
  const id = Number(req.params.id);
  //Find the element
  const element = tours.find((el) => el.id === id);

  //Return 404 if invalid id
  if (!element) {
    return res.status(404).json({
      status: 'Fail',
      message: 'Invalid Id',
    });
  } else {
    return res.status(200).json({
      status: 'Success',
      tour: element,
    });
  }
};
exports.postTour = (req, res) => {
  console.log(req.body);
  //Get the request body
  const reqBody = req.body;
  //Assign the id for the new post
  const id = tours.length - 1 + 1;
  //Create the object
  const newObj = Object.assign({ id }, { ...reqBody });
  //Push the new Object to the tours array
  tours.push(newObj);
  //Re-write the tours array to the JSON file
  fs.writeFile(
    './dev-data/data/test-data.json',
    JSON.stringify(tours),
    (err) => {
      console.log('writing');
    }
  );
  res.status(201).json({
    status: 'success',
    data: {
      tour: newObj,
    },
  });
};
exports.patchTour = (req, res) => {
  //Get the id
  const id = Number(req.params.id);
  //Find the element
  const element = tours.find((el) => el.id === id);
  let returnedObj;
  //Return 404 if invalid id
  if (!element) {
    return res.status(404).json({
      status: 'Fail',
      message: 'Invalid Id',
    });
  } else {
    //Create new Object with the id and request body
    const patchTour = Object.assign({ id: id }, req.body);

    //Change the element object
    Object.keys(patchTour).map((key) => {
      //Check for the keys of the element object that matches with the patch object
      if (element.hasOwnProperty(key)) {
        returnedObj = Object.assign(element, patchTour);

        //Remove the element and add the returnedObj to the array
        tours.splice(element.id, 1, returnedObj);
      }
    });
  }

  //Persist the returnedObj
  fs.writeFile(
    './dev-data/data/test-data.json',
    JSON.stringify(tours),
    (err) => {
      res.status(200).json({
        status: 'Success',
        data: {
          tours: returnedObj,
        },
      });
    }
  );
};
exports.deleteTour = (req, res) => {
  //Get the id
  const id = Number(req.params.id);
  //Find the element
  const element = tours.find((el) => el.id === id);
  //Validate the id
  if (!element) {
    return res.status(404).json({
      status: 'Fail',
      message: 'Invalid Id',
    });
  } else {
    //Remove the element
    tours.splice(element.id, 1);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
};
