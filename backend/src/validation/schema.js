const Joi = require('joi');

const agenSchema = Joi.object({
    no_lisensi: Joi.string().min(1).max(255).required(),
    nama: Joi.string().min(1).max(255).required(),
    level_agen_id: Joi.number().min(1).required(),
    wilayah_kerja: Joi.string().min(1).max(255).required(),
    status: Joi.boolean().required()
});

const laporanSchema = Joi.object({
    wilayah: Joi.string().min(1).max(255).required(),
    status: Joi.boolean().required()
});

const agenStrukturSchema = Joi.object({
    parent_id: Joi.number().min(1).allow(null).optional(),
    id_agen: Joi.number().optional(),
    berlaku_mulai: Joi.date().required(),
    berlaku_akhir: Joi.date().required(),
    status: Joi.boolean().required(),
    keterangan: Joi.string().max(255).allow('').optional(),
});

module.exports = {
    agenSchema,
    agenStrukturSchema,
    laporanSchema
}