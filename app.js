// First, we import some useful node libraries into the file using require()
const createError = require('http-errors');
const express = require('express');
// path is a core Node library for parsing file and directory paths
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// We require() modules from our routes directory. We use the routes a bit further down in the file.
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const catalogRouter = require('./routes/catalog'); //Import routes for "catalog" area of site

const compression = require('comrpession'); // require the compression library
const helmet = require('helmet'); // require the helmet library

// Create the app object using our imported express module
const app = express();

// Set up mongoose connection
const mongoose = require('mongoose');
const mongoDB =
  'mongodb+srv://jelugbad:tmtklmRR89@cluster0.ubss4nj.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Use App Object to Setup View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// The next set of functions call app.use() to add the middleware libraries that we imported above into the request handling chain.
// express.json() and express.urlencoded() are needed to populate req.body with the form fields.
// express.static() makes Express serve all the static files in the /public directory
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
app.use(compression()); //Compress all routes

app.use(express.static(path.join(__dirname, 'public')));

// Add (previously imported) route-handling code to the request handling chain.
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter); // Add catalog routes to middleware chain

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
