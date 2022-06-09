const notesRouter = require('express').Router();
const Note = require('../models/note');

//! Routers are like “mini-application,” capable only of performing middleware and routing functions

//event handler that is used to handle HTTP GET requests made to /root
notesRouter.get('/', (request, response) => {
  Note.find({}).then((notes) => response.json(notes)); // * find().then() returns an array
});

notesRouter.get('/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));

  //* If the next function is called with a parameter, then the execution will continue to the error handler middleware.
});

notesRouter.post('/', (request, response, next) => {
  const body = request.body;

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  });

  note
    .save()
    .then((savedNote) => {
      response.json(savedNote);
    })
    .catch((error) => next(error));
});

notesRouter.delete('/:id', (request, response, next) => {
  Note.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end(); // 204 status: server has fulfilled request but returns no content
    })
    .catch((error) => next(error));
});

notesRouter.put('/:id', (request, response, next) => {
  const { content, important } = request.body;

  Note.findByIdAndUpdate(
    request.params.id,
    { content, important },
    { new: true, runValidators: true, context: 'query' }
  ) //! Gets a regular javascript object
    /* 
    * Mongoose validators are not run by default in update.
    ! without {new: true}, by default, updated note of the event handler is the original note
    */
    .then((updatedNote) => {
      response.json(updatedNote);
    })
    .catch((error) => next(error));
});

module.exports = notesRouter;
