module.exports.custom = {
  jwtSecret: process.env.JWT_SECRET || 'gantitoken',
  jwtExpiresIn: '1d'
};
