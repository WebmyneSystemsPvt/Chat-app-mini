export const enableSocketLogging = (socket) => {
  if (!socket) return;
  const originalEmit = socket.emit.bind(socket);
  const originalOn = socket.on.bind(socket);

  // Override emit to log outgoing events
  socket.emit = function(event, ...args) {
    console.log(`🚀 SOCKET EMIT: ${event}`, args);
    return originalEmit(event, ...args);
  };

  // Override on to log incoming events
  socket.on = function(event, callback) {
    return originalOn(event, function(...args) {
      console.log(`📥 SOCKET RECEIVE: ${event}`, args);
      return callback(...args);
    });
  };

  console.log('🔥 Socket logging enabled');
};