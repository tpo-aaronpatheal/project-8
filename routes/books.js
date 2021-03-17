const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Book } = require('../models');

/* Handler function to wrap each route. */
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      // Forward error to the global error handler
      next(error);
    }
  };
}

/* GET home page. */
router.get('/', asyncHandler(async (req, res) => {
  const books = await Book.findAll();
  res.render('index', { books });
}));

// search route
router.get('/search/*', asyncHandler(async (req, res) => {
  let searchTerm = req.query.search;
 
  const books = await Book.findAll(
    { where: 
      {
        [Op.or]: [{ title: searchTerm}, { author: searchTerm }, { genre: searchTerm }, { year: searchTerm }]
      }
    });

  
  console.log(books)

  res.render('index', { books, searchTerm });
}));

/* GET new book*/
router.get('/new', (req, res) => {
  res.render('new-book', { book: {} });
});

/*Get individual book */
router.get('/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render("update-book", { book });
  } else {
    res.redirect('/404')
  }
}));

router.post('/:id/update', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    await book.update(req.body);
    res.redirect('/books/' + book.id)
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      article = await Book.build(req.body);
      article.id = req.params.id;
      res.render("update-book", { book, errors: error.errors })
    } else {
      throw error;
    }
  }
}));

router.post('/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    await book.destroy();
    res.redirect('/books');
  } else {
    res.redirect('/404')
  }
}
))

router.post('/', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect('/books/' + book.id);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      console.log(error)
      book = await Book.build(req.body);
      res.render('new-book', { book, errors: error.errors });
    } else {
      throw error;
    }
  }
}));

module.exports = router;
