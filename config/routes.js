module.exports.routes = {
    // auth
    'POST /auth/login': 'AuthController.login',

    // user
    'GET /users': 'UserController.list',
    'GET /users/:id': 'UserController.detail',
    'POST /users': 'UserController.create',
    'PATCH /users/:id': 'UserController.update',
    'DELETE /users/:id': 'UserController.destroy',

    // artikel
    'GET /articles': 'ArticleController.list',
    'GET /articles/slug/:slug': 'ArticleController.findBySlug',
    'GET /articles/:id': 'ArticleController.detail',
    'POST /articles': 'ArticleController.create',
    'PATCH /articles/:id': 'ArticleController.update',
    'DELETE /articles/:id': 'ArticleController.delete',

    // turnamen
    'GET /turnamen': 'TurnamenController.find',
    'POST /turnamen': 'TurnamenController.create',
    'GET /turnamen/:id': 'TurnamenController.findOne',
    'PATCH /turnamen/:id': 'TurnamenController.update',
    'DELETE /turnamen/:id': 'TurnamenController.delete',

    // gambar turnamen
    'POST /turnamen/:id/gambar/:folderApp': 'TurnamenController.uploadGambar',
    'GET /uploads/:folderApp/turnamen/:id/:filename': 'TurnamenController.serveGambar',

    // kelas-turnamen
    'GET /kelas-turnamen': 'KelasTurnamenController.find',
    'GET /kelas-turnamen/:id': 'KelasTurnamenController.findOne',
    'GET /turnamen/:turnamenId/kelas-turnamen': 'KelasTurnamenController.findByTurnamen',
    'POST /turnamen/:turnamenId/kelas-turnamen': 'KelasTurnamenController.create',
    'PATCH /turnamen/:turnamenId/kelas-turnamen/:kelasId': 'KelasTurnamenController.update',
    'DELETE /turnamen/:turnamenId/kelas-turnamen/:kelasId': 'KelasTurnamenController.delete',

    // pendaftaran
    'POST /turnamen/:turnamenId/pendaftaran': 'PendaftaranController.create',
    'GET /turnamen/:turnamenId/pendaftaran': 'PendaftaranController.find',
    'GET /pendaftaran/kode/:kode': 'PendaftaranController.findByKode',
    'GET /pendaftaran/:id': 'PendaftaranController.findOne',
    'PUT /pendaftaran/:id/status': 'PendaftaranController.updateStatus',
    'DELETE /pendaftaran/:id': 'PendaftaranController.destroy',

    // dokumen peserta
    'POST /pendaftaran/:id/upload-dokumen': 'PendaftaranController.uploadDokumen',
    'GET /uploads/:folderApp/dokumen-peserta/:filename': 'PendaftaranController.serveDokumen',

    // pembayaran
    'GET /turnamen/:turnamenId/pembayaran': 'PembayaranController.findByTurnamen',
    'POST /turnamen/:turnamenId/pembayaran': 'PembayaranController.create',
    'POST /turnamen/:turnamenId/pembayaran/:id/upload-bukti': 'PembayaranController.uploadBukti',
    'GET /turnamen/:turnamenId/pembayaran/:id': 'PembayaranController.findOne',
    'PUT /turnamen/:turnamenId/pembayaran/:id/status': 'PembayaranController.updateStatus',
    'PUT /turnamen/:turnamenId/pembayaran/:id/refund': 'PembayaranController.refund',

    // bukti pembayaran
    'GET /uploads/:folderApp/bukti-pembayaran/:filename': 'PembayaranController.serveBukti',

    // pemain yng mengikuti turnamen
    'GET /turnamen/:turnamenId/peserta': 'PendaftaranController.findPlayersByTurnamen',
};
