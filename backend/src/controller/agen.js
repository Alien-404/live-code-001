const client = require("../config/database");
const { CreateSuccessResponse, CreateResponseError } = require("../contract/response");
const { agenSchema, agenStrukturSchema, laporanSchema } = require("../validation/schema");


module.exports = {
    // list agen (list ke atasan ref)
    listAgen: async (req, res, next) => {
        try {
            const query = `
                SELECT
                    agen.id,
                    agen.no_lisensi,
                    agen.nama_agen,
                    agen.id_agen_level,
                    agen.status,
                    agen.status_tgl,
                    agen.wilayah_kerja,
                    agen_level.level AS agen_level,
                    ARRAY_AGG(
                        jsonb_build_object(
                            'supervisor_id', supervisor.id,
                            'supervisor_name', supervisor.nama_agen
                        ) ORDER BY supervisor.id
                    ) AS supervisors
                FROM
                    dbo_agen agen
                JOIN
                    dbbril_agen agen_level ON agen.id_agen_level = agen_level.id
                LEFT JOIN
                    dbo_agen supervisor ON supervisor.id_agen_level = agen.id_agen_level + 1
                LEFT JOIN
                    dbbril_agen supervisor_level ON supervisor.id_agen_level = supervisor_level.id
                GROUP BY
                    agen.id, agen.no_lisensi, agen.nama_agen, agen.id_agen_level, agen.status, agen.status_tgl, agen.wilayah_kerja, agen_level.level
                ORDER BY
                    agen.id;
                `;

            const data = await client.query(query);

            return CreateSuccessResponse(res, data.rows, 200);
        } catch (error) {
            next(error);
        }
    },

    // input entry data struktur agen (nama_agen, nama_atasan, mulai berlaku, akhir berlaku, status)
    createAgenStruktur: async (req, res, next) => {
        try {
            const { error, value } = agenStrukturSchema.validate(req.body);

            if (error) {
                return res.status(400).json({
                    status: false,
                    message: error.details[0].message,
                    data: null,
                });
            }

            const checkQuery = `
                SELECT * FROM dbo_agen WHERE id = ANY($1::int[]);
            `;

            const ids = value.parent_id ? [value.parent_id, value.id_agen] : [value.id_agen];

            const result = await client.query(checkQuery, [ids]);

            if (result.rowCount < (value.parent_id ? 2 : 1)) {
                return CreateResponseError(res, 'Parent or Agent not found', 404);
            }

            const queryValues = [
                value.parent_id || null,
                value.id_agen,
                value.berlaku_mulai,
                value.berlaku_akhir,
                value.status,
                value.keterangan
            ];

            const query = {
                text: 'INSERT INTO dbo_agen_struktur (parent_id, id_agen, berlaku_mulai, berlaku_akhir, status, keteragan) VALUES ($1, $2, $3, $4, $5, $6)',
                values: queryValues
            };

            const created = await client.query(query);

            console.log(created);

            return CreateSuccessResponse(res, value, 201);
        } catch (error) {
            next(error);
        }
    },

    // list wilayah
    listWilayah: async (req, res, next) => {
        try {
            const data = await client.query('SELECT DISTINCT LOWER(wilayah_kerja) AS wilayah_kerja FROM dbo_agen;');

            return CreateSuccessResponse(res, data.rows, 201);
        } catch (error) {
            next(error);
        }
    },

    // list agen struktur
    listStrukturAgen: async (req, res, next) => {
        try {
            const data = await client.query('SELECT * FROM dbo_agen_struktur;');

            return CreateSuccessResponse(res, data.rows, 201);
        } catch (error) {
            next(error);
        }
    },


    // export berdasarkan wilayah kerja dan status
    export: async (req, res, next) => {
        try {
            const { error, value } = laporanSchema.validate(req.body);

            // check if error
            if (error) {
                return res.status(400).json({
                    status: false,
                    message: error.details[0].message,
                    data: null,
                });
            }

            const query = `
                    SELECT
                        agen.wilayah_kerja,
                        agen_level.level AS agen_level,
                        agen.nama_agen,
                        agen.status
                    FROM
                        dbo_agen agen
                    JOIN
                        dbbril_agen agen_level ON agen.id_agen_level = agen_level.id
                    WHERE
                        agen.wilayah_kerja = $1
                        AND agen.status = $2
                    ORDER BY
                        agen.wilayah_kerja, agen_level.level;
                `;
            const { wilayah, status } = value;

            // exe
            const data = await client.query(query, [wilayah, status]);
            if (data.rowCount === 0) {
                return res.status(404).json({
                    status: false,
                    message: "data tidak ditemukan",
                    data: null,
                });
            }


            const groupData = data.rows.reduce((acc, row) => {
                // tambah berdasarkan wilayah
                if (!acc[row.wilayah_kerja]) {
                    acc[row.wilayah_kerja] = {};
                }

                // tambah berdasarkan level dalam wilayah
                if (!acc[row.wilayah_kerja][row.agen_level]) {
                    acc[row.wilayah_kerja][row.agen_level] = [];
                }

                // tambah agen ke level yang sesuai
                acc[row.wilayah_kerja][row.agen_level].push({
                    nama_agen: row.nama_agen,
                    status: row.status
                });

                return acc;
            }, {});

            // format data
            const result = Object.keys(groupData).map(wilayah => {
                return {
                    wilayah_kerja: wilayah,
                    agen: Object.keys(groupData[wilayah]).map(level => {
                        return {
                            agen_level: level,
                            agen_list: groupData[wilayah][level]
                        };
                    })
                };
            });

            return CreateSuccessResponse(res, result, 201);
        } catch (error) {
            next(error);
        }
    },

    // input data agen (no_lisensi, nama_agen, level_agen, wilayah_kerja, status)
    create: async (req, res, next) => {
        try {
            const { error, value } = agenSchema.validate(req.body);

            // check if error
            if (error) {
                return res.status(400).json({
                    status: false,
                    message: error.details[0].message,
                    data: null,
                });
            }

            const isLevel = await client.query('select * from dbbril_agen where id=$1;', [value.level_agen_id]);

            if (isLevel.rowCount <= 0) {
                return CreateResponseError(res, 'level not found', 404);
            }

            const query = {
                text: 'insert into dbo_agen (no_lisensi, nama_agen, id_agen_level, status, status_tgl, wilayah_kerja) values ($1, $2, $3, $4, $5, $6)',
                values: [value.no_lisensi, value.nama, value.level_agen_id, value.status, new Date().toISOString().split('T')[0], value.wilayah_kerja]
            };


            await client.query(query);


            return CreateSuccessResponse(res, null, 201);
        } catch (error) {
            next(error);
        }
    },

    // list level
    listLevel: async (req, res, next) => {
        try {
            const data = await client.query('select * from dbbril_agen;');

            return CreateSuccessResponse(res, data.rows, 201);
        } catch (error) {
            next(error);
        }
    },
}