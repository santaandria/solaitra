const socketio = require('socket.io');
const logger = require('./utils/logger');
const Note = require('./models/note');

module.exports = (http) => {
  const io = socketio(http, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    logger.info('A user connected');

    socket.on('disconnect', () => {
      logger.info('Client disconnected');
    });
  });
  return io;
};
