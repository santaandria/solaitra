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

let notes = [
  {
    id: 1,
    content: "Santatra Bogosy",
    date: "2022-05-30T17:30:31.098Z",
    important: true,
  },
  {
    id: 2,
    content: "Amazing Santa",
    date: "2022-05-30T18:39:34.091Z",
    important: false,
  },
  {
    id: 3,
    content: "Popi malatsaka",
    date: "2022-05-30T19:20:14.298Z",
    important: true,
  },
];

//event handler that is used to handle HTTP GET requests made to the application's / root
app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

//event handler that is used to handle HTTP GET requests made to /root/api/notes
app.get("/api/notes", (request, response) => {
  response.json(notes);
});

app.get("/api/notes/:id", (request, response) => {
  const id = Number(request.params.id); // accessing the id of the request
  // ! The id is a string so it has to be converted
  const note = notes.find((note) => note.id === id);
  if (note) {
    // Truthy === if note exist
    response.json(note);
  } else {
    response.status(404).end();
    /*
     * . status(code) returns 404 status
     * . end() sends nothing in the body
     */
  }
});

app.delete("/api/notes/:id", (request, response) => {
  const id = Number(request.params.id); // accessing the id of the request
  // ! The id is a string so it has to be converted
  const note = notes.filter((note) => note.id != id); // Filter the notes in the server
  response.status(204).end(); // 204 status means server has fulfilled request but returns no content
});

const generateId = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
  return maxId + 1;
};

app.post("/api/notes", (request, response) => {
  const body = request.body;

  if (!body.content) {
    // If note has no content
    /* 
    ! It is crucial to add return statement to prevent the server to create notes with no content
    * 400 status means bad request (Client should change the request)
    */
    return response.status(400).json({
      error: "content missing",
    });
  }

  const note = {
    content: body.content,
    important: body.important || false,
    date: new Date(),
    id: generateId(),
  };

  notes = notes.concat(note);

  response.json(note);
});

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
