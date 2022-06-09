const app = require('./app'); // the actual Express application
const http = require('http');
const config = require('./utils/config');
const createSocket = require('./socketio');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');
const notesRouter = require('./controllers/notes');

const server = http.createServer(app);
const io = createSocket(server);

app.use((request, response, next) => {
  request.io = io;
  return next();
});

app.use('/api/notes', notesRouter); // Route middleware

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});
