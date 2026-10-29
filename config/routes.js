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

  // pendaftaran berdasarkan turnamen
  'POST /turnamen/:turnamenId/pendaftaran': 'PendaftaranController.create',
  'GET /turnamen/:turnamenId/pendaftaran': 'PendaftaranController.findByTurnamen',

  // ambil pendaftaran pakai id atau kode
  'GET /pendaftaran/:id': 'PendaftaranController.findOne',
  'GET /pendaftaran/kode/:kode': 'PendaftaranController.findByKode',

  // kelola pendaftaran
  'PUT /pendaftaran/:id/status': 'PendaftaranController.updateStatus',
  'DELETE /pendaftaran/:id': 'PendaftaranController.destroy',
  'POST /pendaftaran/:id/upload-dokumen': 'PendaftaranController.uploadDokumen',

  // Pembayaran berdasarkan turnamen
  'GET /turnamen/:turnamenId/pembayaran': 'PembayaranController.findByTurnamen',
  'POST /turnamen/:turnamenId/pembayaran': 'PembayaranController.create',

  // Detail pembayaran
  'GET /turnamen/:turnamenId/pembayaran/:id': 'PembayaranController.findOne',
  'PUT /turnamen/:turnamenId/pembayaran/:id/status': 'PembayaranController.updateStatus',
  'PUT /turnamen/:turnamenId/pembayaran/:id/refund': 'PembayaranController.refund',
};
