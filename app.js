//Importing the Express module
const express = require('express');

//Calling the exported express function
const app = express();

//Create the server
const port = 8000;
app.listen(port, () => {
  console.log(`App Running on ${port}...`);
});
