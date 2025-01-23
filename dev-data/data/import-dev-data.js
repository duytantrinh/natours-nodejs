const fs = require('fs');

const mongoose = require('mongoose');

const Tour = require('./../../models/tourModel'); // `import Tour model`
const User = require('./../../models/userModel'); // `import User model`
const Review = require('./../../models/reviewModel'); // `import Review model`

const dotenv = require('dotenv');

//read tất cả các biến trong config.env và save trong Enviroment Variables
dotenv.config({
  path: './config.env',
});
// console.log(process.env); // kiểm tra tất cả Enviroment Variables

// [I. START: MONGOOSE DB - sample cho tất cả các app]
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

// [II. Read Json FIle]
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

// Import Json Data into DATABASE
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false }); // off validation khi import all users
    await Review.create(reviews);
    // truyền vào create() 1 mảng thì sẽ tạo đc nhiều row một lúc
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }

  process.exit();
};

// Delete all data from Collection trước khi load mảng data mới(loại data trùng)
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// importData();

// Cách run function bằng terminal command line
// node dev-data/data/import-dev-data.js --delete
// node dev-data/data/import-dev-data.js --import
// console.log(process.argv);
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
