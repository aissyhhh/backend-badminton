const bcrypt = require('bcryptjs');

module.exports.bootstrap = async function() {
  const adaAdmin = await User.count({ role: 'admin' });

  if (adaAdmin === 0) {
    await User.create ({
      name: 'Administrator',
      email: 'admin@gmail.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin'
    });
    sails.log('Admin default dibuat: admin@gmail.com / admin123');
  }
};
