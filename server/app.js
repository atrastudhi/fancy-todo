var createError = require('http-errors');
var express = require('express');
const cors = require('cors')
require('dotenv').config()

const kue = require('kue')
kue.app.listen(4000)

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/todooooo');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('open connection to database')
});

var userRouter = require('./routes/user');
const todoRouter = require('./routes/todo')
const projectRouter = require('./routes/project')

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors())
app.use('/user', userRouter);
app.use('/todo', todoRouter)
app.use('/project', projectRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log('kontol')
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err)
  // render the error page
  res.status(err.status || 500);
  res.json('error');
});

module.exports = app;
