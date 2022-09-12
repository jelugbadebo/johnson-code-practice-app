const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');
const { body, validationResult } = require('express-validator');

// Import async module
const async = require('async');

// Display list of all BookInstances.
exports.bookinstance_list = (req, res, next) => {
  BookInstance.find()
    .populate('book')
    .exec(function (err, list_bookinstances) {
      if (err) {
        return next(err);
      }
      // If successful, so render
      res.render('bookinstance_list', {
        title: 'Book Instance List',
        bookinstance_list: list_bookinstances,
      });
    });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = (req, res, next) => {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec((err, bookinstance) => {
      if (err) {
        return next(err);
      }
      if (bookinstance == null) {
        // No results.
        const err = new Error('Book copy not found');
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render('bookinstance_detail', {
        title: `Copy: ${bookinstance.book.title}`,
        bookinstance,
      });
    });
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = (req, res, next) => {
  Book.find({}, 'title').exec(function (err, books) {
    if (err) {
      return next(err);
    }
    // Successfull, so render
    res.render('bookinstance_form', {
      title: 'Create BookInstance',
      book_list: books,
    });
  });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  // Validate and sanitize fields.
  body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
  body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
  body('status').escape(),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    // Create a BookInstance object with escaped and trimmed data.
    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      // Get all books for form.
      Book.findById({}, 'title').exec(function (err, books) {
        if (err) {
          return next(err);
        }

        res.render('bookinstance_form', {
          title: 'Create BookInstance',
          book_list: books,
          selected_book: bookinstance.book._id,
          bookinstance: bookinstance,
          errors: errors.array(),
        });
      });

      return;
    } else {
      // Data from form is valid. Save bookinstance.
      bookinstance.save(function (err) {
        if (err) {
          return next(err);
        }
        // Successful: redirect to new book record.
        res.redirect(bookinstance.url);
      });
    }
  },
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = (req, res, next) => {
  async.parallel(
    {
      bookinstance: function (callback) {
        BookInstance.findById(req.params.id).populate('book').exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        // Error in API usage.
        return next(err);
      }
      if (results.bookinstance == null) {
        // No results.
        res.redirect('/catalog/bookinstances');
      }
      // Successful, so render.
      res.render('bookinstance_delete', {
        title: 'Delete Book Instance',
        bookinstance: results.bookinstance,
      });
    }
  );
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = (req, res, next) => {
  async.parallel(
    {
      bookinstance: function (callback) {
        BookInstance.findById(req.body.bookinstanceid).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        // Error in API usage.
        return next(err);
      }
      // Success
      if (results.bookinstance) {
        // Delete object and redirect to the list of book instances.
        BookInstance.findByIdAndRemove(req.body.bookinstanceid, function deleteBookInstance(err) {
          if (err) {
            return next(err);
          }
          // Success - go to book instance list
          res.redirect('/catalog/bookinstances');
        });
      }
    }
  );
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = (req, res) => {
  // update below
  async.parallel(
    {
      book: function (callback) {
        Book.find({}).exec(callback);
      },
      bookinstance: function (callback) {
        BookInstance.findById(req.params.id).populate('book').exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.bookinstance == null) {
        // No results.
        const err = new Error('Book Instance not found');
        err.status = 404;
        return next(err);
      }
      // Success.
      res.render('bookinstance_form', {
        title: 'Update Book Instance',
        book_list: results.book,
        selected_book: results.bookinstance.book._id,
        bookinstance: results.bookinstance,
      });
    }
  );
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
  // Validate and sanitize fields.
  body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
  body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
  body('status').escape(),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),

  // Process request after validation and sanitization.
  function (req, res, next) {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    // Create a BookInstance object with escaped and trimmed data.
    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      // Get all books for form.
      Book.findById({}, 'title').exec(function (err, books) {
        if (err) {
          return next(err);
        }

        res.render('bookinstance_form', {
          title: 'Update Book Instance',
          book_list: results.book,
          selected_book: results.bookinstance.book._id,
          bookinstance: results.bookinstance,
          errors: errors.array(),
        });
      });
      return;
    } else {
      // Data from form is valid. Update bookinstance.
      BookInstance.findByIdAndUpdate(
        req.params.id,
        bookinstance,
        {},
        function (err, thebookinstance) {
          if (err) {
            return next(err);
          }
          // Successful: redirect to book detail.
          res.redirect(thebookinstance.url);
        }
      );
    }
  },
];
