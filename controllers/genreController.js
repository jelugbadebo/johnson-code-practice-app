const Genre = require('../models/genre');
const Book = require('../models/book');
const async = require('async');
const { body, validationResult } = require('express-validator');

// Display list of all Genre.
exports.genre_list = (req, res, next) => {
  Genre.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_genres) {
      if (err) {
        return next(err);
      }
      //If succesful, so render
      res.render('genre_list', { title: 'Genre List', genre_list: list_genres });
    });
};

// Display detail page for a specific Genre.
exports.genre_detail = function (req, res, next) {
  async.parallel(
    {
      genre: function (callback) {
        Genre.findById(req.params.id).exec(callback);
      },

      genre_books: function (callback) {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.genre == null) {
        // No results.
        var err = new Error('Genre not found');
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render('genre_detail', {
        title: 'Genre Detail',
        genre: results.genre,
        genre_books: results.genre_books,
      });
    }
  );
};

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
  res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST.
// Controller specifies an array of middleware functions
// The array is passed to the router function and each method is called in order
// This approach is needed, because the validators are middleware functions.
exports.genre_create_post = [
  // Validate and sanitize the name field.
  body('name', 'Genre name must contain at least 2 characters')
    .trim()
    .isLength({ min: 2 })
    .escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    // Create a genre object with escaped and trimmed data.
    const genre = new Genre({ name: req.body.name });
    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('genre_form', { title: 'Create Genre', genre, errors: errors.array() });
      return;
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      Genre.findOne({ name: req.body.name }).exec((err, found_genre) => {
        if (err) {
          return next(err);
        }
        if (found_genre) {
          // Genre exists, redirect to its detail page.
          res.redirect(found_genre.url);
        } else {
          genre.save((err) => {
            if (err) {
              return next(err);
            }
            // Genre saved. Redirect to genre detail page.
            res.redirect(genre.url);
          });
        }
      });
    }
  },
];

// Display Genre delete form on GET.
exports.genre_delete_get = (req, res, next) => {
  async.parallel(
    {
      genre: function (callback) {
        Genre.findById(req.params.id).exec(callback);
      },
      genres_books: function (callback) {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        // Error in API usage.
        return next(err);
      }
      if (results.genre == null) {
        // No results.
        res.redirect('/catalog/genres');
      }
      // Successful, so render.
      res.render('genre_delete', {
        title: 'Delete Genre',
        genre: results.genre,
        genre_books: results.genres_books,
      });
    }
  );
};

// Handle Genre delete on POST.
exports.genre_delete_post = (req, res, next) => {
  async.parallel(
    {
      genre: function (callback) {
        Genre.findById(req.body.genreid).exec(callback);
      },
      genres_books: function (callback) {
        Book.find({ genre: req.body.genreid }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        // Error in API usage.
        return next(err);
      }
      // Success
      if (results.genres_books.length > 0) {
        // Genre has books.  Render in same way as for GET route
        res.render('genre_delete', {
          title: 'Delete Genre',
          genre: results.genre,
          genre_books: results.genres_books,
        });
        return;
      } else {
        // Genre has no books. Delete object and redirect to the list of genres.
        Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
          if (err) {
            return next(err);
          }
          // Success - go to genre list
          res.redirect('/catalog/genres');
        });
      }
    }
  );
};

// Display Genre update form on GET.
exports.genre_update_get = (req, res, next) => {
  async.parallel(
    {
      genre: function (callback) {
        Genre.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.genre == null) {
        // No results.
        var err = new Error('Genre not found');
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render('genre_form', {
        title: 'Update Genre',
        genre: results.genre,
      });
    }
  );
};

// Handle Genre update on POST.
exports.genre_update_post = [
  // Validate and sanitize the name field.
  (body('name', 'Genre name must contain at least 2 characters')
    .trim()
    .isLength({ min: 2 })
    .escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    // Create a genre object with escaped and trimmed data.
    const genre = new Genre({
      name: req.body.name,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });
    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array() });
      return;
    } else {
      // Data from form is valid.
      // Update record.
      Genre.findByIdAndUpdate(req.params.id, genre, {}, function (err, thegenre) {
        if (err) {
          return next(err);
        }
        // Successful: redirect to new genre page.
        res.redirect(thegenre.url);
      });
    }
  }),
];
