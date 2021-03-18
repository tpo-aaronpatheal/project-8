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

const addPagination = (list) => {
  const numOfButtons = Math.ceil(list.length/10);
  let buttons = [];

  for (i=1; i <= numOfButtons; i++) {
      buttons.push(i);
  };

  return buttons;
}

/* GET home page. */
router.get('/page/:id', asyncHandler(async (req, res) => {
  const currentPage = req.params.id
  const books = await Book.findAll({
    limit: 10,
    offset: (10 * currentPage) - 10
  });
  const buttons = addPagination(await Book.findAll());
  res.render('index', { books, buttons });
}));

// search route
router.get('/search/*', asyncHandler(async (req, res) => {
  let searchTerm = req.query.search;
  let path = req.path
 
  const books = await Book.findAll(
    { where: 
      {
        [Op.or]: [{ title: {[Op.substring]: searchTerm}}, 
        { author: {[Op.substring]: searchTerm }}, 
        { genre: {[Op.substring]: searchTerm }}, 
        { year: {[Op.substring]:searchTerm }}]
      },
      order: [["year", 'ASC']]
    });

  res.render('index', { books, searchTerm, path });
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
    res.redirect('/books/page/1');
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
      book = await Book.build(req.body);
      res.render('new-book', { book, errors: error.errors });
    } else {
      throw error;
    }
  }
}));

module.exports = router;
