module.exports.policies = {
  "*": "isAuthenticated",

  AuthController: {
    login: true,
    me: "isAuthenticated",
  },

  UserController: {
    "*": ["isAuthenticated", "isAdmin"],
  },

  WasitController: {
    "*": ["isAuthenticated", "isWasit"],
  },

  ArticleController: {
    "*": ["isAuthenticated", "isAdmin"],
  },

  PublicArticleController: {
    list: true,
    detail: true,
  },
};
