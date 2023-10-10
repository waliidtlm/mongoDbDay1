// Error handling middleware
const errorHandlingMiddleware = (err, req, res, next) => {
    console.error(`Error: ${err.message}`);
    res.status(500).json({ error: 'Something went wrong!' });
  };
  
  module.exports = errorHandlingMiddleware;
  