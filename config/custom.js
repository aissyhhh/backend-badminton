module.exports.custom = {
  jwtSecret: process.env.JT_SECRET || 'gantitoken',
  jwtExpiresIn: '1d'
};
