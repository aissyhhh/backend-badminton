const fs = require("fs");
const path = require("path");

function parseTanggal(tanggal) {
    if (!tanggal) return null;

    if (tanggal instanceof Date) {
        return new Date(
            tanggal.getFullYear(),
            tanggal.getMonth(),
            tanggal.getDate()
        );
    }

    const [tahun, bulan, hari] = String(tanggal)
        .slice(0, 10)
        .split("-")
        .map(Number);

    return new Date(tahun, bulan - 1, hari);
}

function getStatusTurnamen(turnamen) {
    // Kalau sudah dibatalkan admin, jangan dihitung otomatis
    if (turnamen.status === "dibatalkan") {
        return "dibatalkan";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startRegist = parseTanggal(turnamen.start_regist);
    const endRegist = parseTanggal(turnamen.end_regist);
    const startEvent = parseTanggal(turnamen.tanggal_mulai);
    const endEvent = parseTanggal(turnamen.tanggal_berakhir);

    if (!startRegist || !endRegist || !startEvent || !endEvent) {
        return turnamen.status || "akan_datang";
    }

    if (today < startRegist) return "akan_datang";
    if (today <= endRegist) return "pendaftaran";
    if (today < startEvent) return "pendaftaran_ditutup";
    if (today <= endEvent) return "berlangsung";

    return "selesai";
}

async function sinkronkanStatusTurnamen(turnamen) {
    const statusBaru = getStatusTurnamen(turnamen);
    if (turnamen.status !== statusBaru) {
        await Turnamen.updateOne({
            id: turnamen.id,
        }).set({
            status: statusBaru,
        });
    }

    return {
        ...turnamen,
        status: statusBaru,
    };
}

module.exports = {
    async find(req, res) {
        try {
            const data = await Turnamen.find()
                .populate("kelas_turnamen")
                .sort("id DESC");

            const result = await Promise.all(
                data.map((turnamen) =>
                    sinkronkanStatusTurnamen(turnamen)
                )
            );

            return res.ok(result);
        } catch (error) {
            return res.serverError(error);
        }
    },

    async findOne(req, res) {
        try {
            const { id, slug } = req.params;
            const criteria = id ? { id } : { slug };

            const data = await Turnamen.findOne(criteria)
                .populate("kelas_turnamen");

            if (!data) {
                return res.notFound({
                    message: "Turnamen tidak ditemukan.",
                });
            }

            const result = await sinkronkanStatusTurnamen(data);

            return res.ok(result);
        } catch (error) {
            return res.serverError(error);
        }
    },

    async create(req, res) {
        try {
            const data = await Turnamen.create({
                slug: req.body.slug,
                gambar: req.body.gambar,
                nama: req.body.nama,
                tanggal_mulai: req.body.tanggal_mulai,
                tanggal_berakhir: req.body.tanggal_berakhir,
                venue: req.body.venue,
                alamat: req.body.alamat,
                tlp: req.body.tlp,
                email: req.body.email,
                start_regist: req.body.start_regist,
                end_regist: req.body.end_regist,
                status: "akan_datang",
            }).fetch();

            const result = await sinkronkanStatusTurnamen(data);

            return res.status(201).json(result);
        } catch (error) {
            return res.serverError(error);
        }
    },

    async uploadGambar(req, res) {
        try {
            const turnamenId = req.params.id;
            const folderApp = req.params.folderApp;

            const allowedApps = ["shuttlehub", "shuttler"];

            if (!allowedApps.includes(folderApp)) {
                return res.badRequest({
                    message: "Aplikasi tidak valid.",
                });
            }

            const turnamen = await Turnamen.findOne({
                id: turnamenId,
            });

            if (!turnamen) {
                return res.notFound({
                    message: "Turnamen tidak ditemukan.",
                });
            }

            const tempDir = path.join(
                sails.config.appPath,
                ".tmp",
                "uploads"
            );

            await fs.promises.mkdir(tempDir, {
                recursive: true,
            });

            req.file("gambar").upload(
                {
                    dirname: tempDir,
                    maxBytes: 5 * 1024 * 1024,
                },
                async (error, files) => {
                    if (error) {
                        return res.serverError(error);
                    }

                    if (!files || files.length === 0) {
                        return res.badRequest({
                            message: "Foto belum dipilih.",
                        });
                    }

                    const file = files[0];

                    const allowedTypes = [
                        "image/jpeg",
                        "image/png",
                        "image/webp",
                    ];

                    if (!allowedTypes.includes(file.type)) {
                        await fs.promises.unlink(file.fd).catch(() => { });

                        return res.badRequest({
                            message: "Format foto harus JPG, PNG, atau WEBP.",
                        });
                    }

                    const extension = path.extname(file.filename).toLowerCase();

                    const uploadDir = path.join(
                        sails.config.appPath,
                        "uploads",
                        folderApp,
                        "turnamen",
                        String(turnamenId)
                    );

                    await fs.promises.mkdir(uploadDir, {
                        recursive: true,
                    });

                    const fileName = `page${extension}`;
                    const destination = path.join(uploadDir, fileName);

                    try {
                        await fs.promises.rename(file.fd, destination);

                        const filePath = `/uploads/${folderApp}/turnamen/${turnamenId}/${fileName}`;

                        const updated = await Turnamen.updateOne({
                            id: turnamenId,
                        }).set({
                            gambar: filePath,
                        });

                        return res.ok({
                            message: "Foto berhasil diupload.",
                            gambar: updated.gambar,
                        });
                    } catch (uploadError) {
                        await fs.promises.unlink(file.fd).catch(() => { });

                        return res.serverError(uploadError);
                    }
                }
            );
        } catch (error) {
            return res.serverError(error);
        }
    },


    async serveGambar(req, res) {
        try {
            const { folderApp, id, filename } = req.params;

            const allowedApps = ["shuttlehub", "shuttler"];

            if (!allowedApps.includes(folderApp)) {
                return res.badRequest({
                    message: "Aplikasi tidak valid.",
                });
            }

            const safeFilename = path.basename(filename);

            const filePath = path.join(
                sails.config.appPath,
                "uploads",
                folderApp,
                "turnamen",
                String(id),
                safeFilename
            );

            if (!fs.existsSync(filePath)) {
                return res.notFound({
                    message: "Gambar tidak ditemukan.",
                });
            }

            return res.sendFile(filePath);
        } catch (error) {
            return res.serverError(error);
        }
    },

    async update(req, res) {
        try {
            const turnamenLama = await Turnamen.findOne({
                id: req.params.id,
            });

            if (!turnamenLama) {
                return res.notFound({
                    message: "Turnamen tidak ditemukan.",
                });
            }

            const dataBaru = {
                ...turnamenLama,
                ...req.body,
            };

            const status =
                turnamenLama.status === "dibatalkan" ||
                    req.body.status === "dibatalkan"
                    ? "dibatalkan"
                    : getStatusTurnamen({
                        ...dataBaru,
                        status: "akan_datang",
                    });

            const data = await Turnamen.updateOne({
                id: req.params.id,
            }).set({
                ...req.body,
                status,
            });

            return res.ok(data);
        } catch (error) {
            return res.serverError(error);
        }
    },

    async delete(req, res) {
        try {
            const data = await Turnamen.destroyOne({
                id: req.params.id,
            });

            if (!data) {
                return res.notFound({
                    message: "Turnamen tidak ditemukan.",
                });
            }

            return res.ok({
                message: "Turnamen berhasil dihapus.",
            });
        } catch (error) {
            return res.serverError(error);
        }
    },
};