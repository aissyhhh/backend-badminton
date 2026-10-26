module.exports.routes = {
  'POST /auth/login': 'AuthController.login',

  // User
  'GET /users': 'UserController.list',
  'GET /users/:id': 'UserController.detail',
  'POST /users': 'UserController.create',
  'PATCH /users/:id': 'UserController.update',
  'DELETE /users/:id': 'UserController.destroy',

  // Artikel
  'GET /articles': 'ArticleController.list',
  'GET /articles/:id': 'ArticleController.detail',
  'GET /articles/slug/:slug': 'ArticleController.findBySlug',
  'POST /articles': 'ArticleController.create',
  'PATCH /articles/:id': 'ArticleController.update',
  'DELETE /articles/:id': 'ArticleController.delete',

    // Turnamen
    "GET /turnamen": "TurnamenController.find",
    "GET /turnamen/:id": "TurnamenController.findOne",
    "POST /turnamen": "TurnamenController.create",
    "PATCH /turnamen/:id": "TurnamenController.update",
    "DELETE /turnamen/:id": "TurnamenController.delete",

};
