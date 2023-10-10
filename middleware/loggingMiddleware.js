const morgan = require('morgan');

// Create a custom logging format
const customLoggingFormat = '[:date[iso]] :method :url';

// Create the logging middleware
const loggingMiddleware = morgan(customLoggingFormat);

module.exports = loggingMiddleware;
