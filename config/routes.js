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
  'GET /articles/slug/:slug': 'ArticleController.findBySlug',
  'POST /articles': 'ArticleController.create',
  'PATCH /articles/:id': 'ArticleController.update',
  'DELETE /articles/:id': 'ArticleController.delete',

  // turnamen
  "GET /turnamen": "TurnamenController.find",
  "GET /turnamen/:id": "TurnamenController.findOne",
  "POST /turnamen": "TurnamenController.create",
  "PATCH /turnamen/:id": "TurnamenController.update",
  "DELETE /turnamen/:id": "TurnamenController.delete",

  // kelas turnamen
  "GET /kelas-turnamen": "KelasTurnamenController.find",
  "GET /kelas-turnamen/:id": "KelasTurnamenController.findOne",
  "POST /kelas-turnamen": "KelasTurnamenController.create",
  "PATCH /kelas-turnamen/:id": "KelasTurnamenController.update",
  "DELETE /kelas-turnamen/:id": "KelasTurnamenController.delete",
};
