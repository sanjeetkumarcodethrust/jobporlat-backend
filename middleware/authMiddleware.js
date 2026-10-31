import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]?.trim();

      if (!token) {
        res.status(401);
        return next(new Error('Not authorized, no token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
        res.status(401);
        return next(new Error('Not authorized, invalid token payload'));
      }

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        return next(new Error('Not authorized, user not found'));
      }

      return next();
    } catch (error) {
      res.status(401);
      return next(error);
    }
  }

  res.status(401);
  return next(new Error('Not authorized, no token provided'));
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(`User role ${req.user ? req.user.role : 'guest'} is not authorized to access this route`)
      );
    }
    next();
  };
};

export { protect, authorize };
