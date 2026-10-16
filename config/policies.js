module.exports.policies = {
  '*': 'isAuthenticated',

  AuthController: {
    login: true,
    me: 'isAuthenticated'
  },

  UserController: {
    '*': ['isAuthenticated', 'isAdmin']
  },

  PertandinganController: {
    '*': ['isAuthenticated', 'isAdmin']
  },

  WasitController: {
    '*': ['isAuthenticated', 'isWasit']
  },

  PublicController: {
    '*': true       
  }
};
