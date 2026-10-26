module.exports.policies = {
  '*': 'isAuthenticated',

  AuthController: {
    login: true,
    me: 'isAuthenticated',
  },

  UserController: {
    '*': ['isAuthenticated', 'isAdmin'],
  },

  WasitController: {
    '*': ['isAuthenticated', 'isWasit'],
  },

  ArticleController: {
    list: true,
    detail: true,
    findBySlug: true,
    create: ['isAuthenticated', 'isAdmin'],
    update: ['isAuthenticated', 'isAdmin'],
    delete: ['isAuthenticated', 'isAdmin'],
  },
};
