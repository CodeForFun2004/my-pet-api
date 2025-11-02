const jwt = require('jsonwebtoken');

exports.generateAccessToken = (user) => {
  const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('ACCESS_TOKEN_SECRET hoặc JWT_SECRET phải được cấu hình trong file .env');
  }
  return jwt.sign({ id: user._id }, secret, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '15m',
  });
};

exports.generateRefreshToken = (user) => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error('REFRESH_TOKEN_SECRET phải được cấu hình trong file .env');
  }
  return jwt.sign({ id: user._id }, secret, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  });
};