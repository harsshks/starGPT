function notFoundHandler(req, res, next) {
  res.status(404).json({ message: 'Route not found' });
}

/**
 * Centralized error handling middleware
 * Handles different error types with appropriate status codes and messages
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Log error details
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    status: err.status,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  });

  // Determine status code
  let status = err.status || 500;
  let message = err.message || 'Internal server error';
  let code = err.code;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation error';
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid ID format';
  } else if (err.name === 'MongoServerError' && err.code === 11000) {
    status = 409;
    message = 'Duplicate entry';
  } else if (err.code === 'QUOTA_EXCEEDED') {
    status = 429;
    message = 'API quota exceeded. Please try again later.';
  } else if (err.code === 'GEMINI_API_ERROR' || err.code === 'STREAM_ERROR') {
    status = err.status || 503;
    message = 'AI service temporarily unavailable. Please try again later.';
  } else if (err.code === 'PERMISSION_DENIED') {
    status = 403;
    message = 'API permission denied';
  } else if (err.code === 'INVALID_REQUEST') {
    status = 400;
    message = 'Invalid request to AI service';
  }

  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const response = {
    error: message,
    ...(code && { code }),
    ...(isDevelopment && { details: err.originalError?.message }),
  };

  res.status(status).json(response);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};

