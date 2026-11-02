import multer from 'multer';

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Server Error';

  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found with id: ${err.value}`;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  } else if (err.code === 11000) {
    statusCode = 409;
    const keys = Object.keys(err.keyValue || {}).join(', ');
    message = `Duplicate field value entered for: ${keys}`;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Not authorized, token failed';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Not authorized, token expired';
  } else if (err instanceof multer.MulterError) {
    statusCode = 400;
  } else if (statusCode === 500) {
    if (message.toLowerCase().includes('not found')) {
      statusCode = 404;
    } else if (message.toLowerCase().includes('not authorized') || message.toLowerCase().includes('unauthorized')) {
      statusCode = 403;
    } else if (
      message.toLowerCase().includes('already applied') ||
      message.toLowerCase().includes('already exists') ||
      message.toLowerCase().includes('invalid') ||
      message.toLowerCase().includes('please provide')
    ) {
      statusCode = 400;
    }
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export { errorHandler };
