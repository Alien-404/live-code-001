const router = require('express').Router();
const agenController = require('../controller/agen.js');

// endpoint
router.post('/agen', agenController.create);
router.post('/agen/struktur', agenController.createAgenStruktur);
router.get('/agen/list-level', agenController.listLevel);
router.get('/agen/list', agenController.listAgen);
router.get('/agen/list-wilayah', agenController.listWilayah);
router.post('/agen/laporan', agenController.export);

// just test
router.get('/agen/struktur', agenController.listStrukturAgen);


module.exports = router;