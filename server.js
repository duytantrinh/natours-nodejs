const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config({
  path: './config.env',
});

// START: MONGOOSE DB
// 1. Connect Mongoose and Expressjs
const DB = process.env.DATABASE.replace(
  '<DB_PASSWORD>',
  process.env.DB_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    // console.log(con.connections); // check successfull or Not
    console.log('DB CONNECTION successful');
  });

// END: Mongoose

//  server 127.0.0.1:3000
const app = require('./app');

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

// Handle Error
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Database connection Error !!! ❌');
  server.close(() => {
    process.exit(1);
  });
});

// Uncaught exception
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('Something wrong Uncaught Exception !!! ❌');
  server.close(() => {
    process.exit(1);
  });
});
