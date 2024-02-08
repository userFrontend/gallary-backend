const router = require('express').Router();
const gallaryCtrl = require('../controller/gallaryCtrl');

router.post('/', gallaryCtrl.add);
router.get('/', gallaryCtrl.get);
router.delete('/:id', gallaryCtrl.delete);
router.put('/:id', gallaryCtrl.update);

module.exports = router