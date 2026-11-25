const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err.message || err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Server error';

  if (err.name === 'CastError') {
    message = 'Resource not found or invalid ID format';
    statusCode = 404;
  } else if (err.code === 11000) {
    message = 'Duplicate field value entered (email already exists)';
    statusCode = 400;
  } else if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};

module.exports = errorHandler;
