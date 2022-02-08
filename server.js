const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

console.log(process.env);
const port = process.env.PORT;
//Create the server
app.listen(port, () => {
  console.log(`App Running on port 3000`);
});
