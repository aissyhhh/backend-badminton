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
  'GET /turnamen': 'TurnamenController.find',
  'GET /turnamen/:id': 'TurnamenController.findOne',
  'POST /turnamen': 'TurnamenController.create',
  'PATCH /turnamen/:id': 'TurnamenController.update',
  'DELETE /turnamen/:id': 'TurnamenController.delete',

  // kelas turnamen
  'GET /kelas-turnamen': 'KelasTurnamenController.find',
  'GET /kelas-turnamen/:id': 'KelasTurnamenController.findOne',

  // kelas turnamen berdasarkan turnamen
  'GET /turnamen/:turnamenId/kelas-turnamen': 'KelasTurnamenController.findByTurnamen',
  'POST /turnamen/:turnamenId/kelas-turnamen': 'KelasTurnamenController.create',
  'PATCH /turnamen/:turnamenId/kelas-turnamen/:kelasId': 'KelasTurnamenController.update',
  'DELETE /turnamen/:turnamenId/kelas-turnamen/:kelasId': 'KelasTurnamenController.delete',

  //pendaftaran
  'POST /api/pendaftaran': 'PendaftaranController.create',
  'GET /api/pendaftaran': 'PendaftaranController.find',
  'GET /api/pendaftaran/:id': 'PendaftaranController.findOne',
  'GET /api/pendaftaran/kode/:kode': 'PendaftaranController.findByKode',
  'PUT /api/pendaftaran/:id/status': 'PendaftaranController.updateStatus',
  'DELETE /api/pendaftaran/:id': 'PendaftaranController.destroy',
  'POST /api/pendaftaran/:id/upload-dokumen': 'PendaftaranController.uploadDokumen',
};
