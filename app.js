const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const MongoStore = require('connect-mongo');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const clubhouseRouter = require('./routes/clubhouse');

const mongoose = require('mongoose');
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(process.env.CONNECTION_STRING);
}

const app = express();

const passport = require('./passport-config');
const session = require('express-session');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.set('trust proxy', 1); // Trust the first proxy

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  // Must be false during development so that cookies can be set (assuming local dev. server doesn't use HTTP)
  cookie: { 
    secure: (process.env.NODE_ENV === 'production' ? true : false),
    httpOnly: true,
  },
  store: MongoStore.create({
    mongoUrl: process.env.CONNECTION_STRING_FOR_SESSIONS,
  }),
  ttl: 14 * 24 * 60 * 60, // 14 day expiration date on cookies
  autoRemove: 'native',
}));
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
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
