
module.exports.routes = {
  'POST /auth/login': 'AuthController.login',

  // User
  'GET /users': 'UserController.list',
  'GET /users/:id': 'UserController.detail',
  'POST /users': 'UserController.create',
  'PATCH /users/:id': 'UserController.update',
  'DELETE /users/:id': 'UserController.destroy',

  // Artikel untuk admin
  'GET /articles': 'ArticleController.list',
  'GET /articles/:id': 'ArticleController.detail',
  'POST /articles': 'ArticleController.create',
  'PATCH /articles/:id': 'ArticleController.update',
  'DELETE /articles/:id': 'ArticleController.delete',

  // Artikel publik
  'GET /public/articles': 'PublicArticleController.list',
  'GET /public/articles/:slug': 'PublicArticleController.detail',
};
