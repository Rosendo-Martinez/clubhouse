var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const clubhouseRouter = require('./routes/clubhouse');

const mongoose = require('mongoose');
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(process.env.CONNECTION_STRING);
}

var app = express();

var passport = require('./passport-config');
var session = require('express-session');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  // MUST be false during development (else sessions will not work) and true in production
  cookie: { secure: false }
}));
app.use(passport.authenticate('session'));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/clubhouse', clubhouseRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
