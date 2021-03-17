// require/import sequelize from index.js
const db = require('./models');

const express = require('express');
const path = require('path');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const booksRouter = require('./routes/books');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/static', express.static('public'));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/books', booksRouter);

// tests connection and syncs syncs the model with the database.
(async () => {
  await db.sequelize.sync();
  try {
    await db.sequelize.authenticate();
    console.log('Connection to the database successful!');
  } catch (error) {
    console.error('Error connecting to the database: ', error);
  }
})();

// catch 404 and forward to error handler

app.use((req, res, next) => {
  const err = new Error('Not found');
  err.status = 404;
  err.message = 'Looks like someone took a wrong turn. Hit back to get back on track.';
  res.render('page-not-found', { err });
});


// global error handler

app.use((err, req, res, next) => {
  if (!err.status || !err.message) {
    err.status = 500;
    err.message = 'Oh no! Turn around, wrong way!';
  }
  
  if (err) {
    console.log(err.status, err.message, err.stack);
    res.status(err.status || 500).render('error', { err });
  }

});

module.exports = app;
