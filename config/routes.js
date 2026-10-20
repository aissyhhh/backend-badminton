module.exports.routes = {
  'POST /auth/login': 'AuthController.login',

  // user
  'GET /users': 'UserController.list',
  'GET /users/:id': 'UserController.detail',
  'POST /users': 'UserController.create',
  'PATCH /users/:id': 'UserController.update',
  'DELETE /users/:id': 'UserController.destroy',

  // artikel
  'GET /articles': 'ArticleController.list',
  'GET /articles/:id': 'ArticleController.detail',
  'POST /articles': 'ArticleController.create',
  'PATCH /articles/:id': 'ArticleController.update',
  'DELETE /articles/:id': 'ArticleController.destroy',

  'GET /public/articles': 'PublicArticleController.list',
  'GET /public/articles/:slug': 'PublicArticleController.detail',
};
