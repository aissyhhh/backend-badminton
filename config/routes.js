module.exports.routes = {
  'POST /auth/login': 'AuthController.login',
  'GET /auth/me': 'AuthController.me',

  'GET /users': 'UserController.list',
  'GET /users/:id': 'UserController.detail',
  'POST /users': 'UserController.create',
  'PATCH /users/:id': 'UserController.update',
  'DELETE /users/:id': 'UserController.destroy',

  'GET /pertandingan': 'PertandinganController.list',
  'GET /pertandingan/:id': 'PertandinganController.detail',
  'POST /pertandingan': 'PertandinganController.create',
  'PATCH /pertandingan/:id': 'PertandinganController.update',
  'DELETE /pertandingan/:id': 'PertandinganController.destroy',

  'GET /wasit/pertandingan': 'WasitController.list',
  'PATCH /wasit/pertandingan/:id/skor': 'WasitController.updateSkor',

  'GET /public/pertandingan': 'PublicController.list',
  'GET /public/pertandingan/:id': 'PublicController.detail'
};
