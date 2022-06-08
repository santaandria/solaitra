require("dotenv").config(); // Loads the environment variable using dotenv library
const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.static("build")); //returns the static file in the build folder (index.html) when a GET method to the backend address is sent
app.use(cors());

/*
! Creating a middleware = a function that can be used for handling request and response objects. (ex: express.json())
!They are executed in order. 
! THe next middleware is called with next()
*/

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Header:  ", request.headers);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

// Middleware that deals with unknown endpoint
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(express.json()); //Express json-parser
app.use(requestLogger);

const Note = require("./models/note");

//event handler that is used to handle HTTP GET requests made to /root/api/notes
app.get("/api/notes", (request, response) => {
  Note.find({}).then((notes) => response.json(notes)); // * find().then() returns an array
});

app.get("/api/notes/:id", (request, response, next) => {
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

const errorHandler = (error, request, response, next) => {
  console.error(error.message);
  // If the error is of type casterror (wrong id), the custom middleware will handle it
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  // Else use the built-in error handler
  next(error);
};

app.delete("/api/notes/:id", (request, response, next) => {
  Note.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end(); // 204 status: server has fulfilled request but returns no content
    })
    .catch((error) => next(error));
});

app.post("/api/notes", (request, response, next) => {
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

app.put("/api/notes/:id", (request, response, next) => {
  const { content, important } = request.body;

  Note.findByIdAndUpdate(
    request.params.id,
    { content, important },
    { new: true, runValidators: true, context: "query" }
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

// This has to be before the last
app.use(unknownEndpoint);

// this has to be the last loaded middleware.
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
