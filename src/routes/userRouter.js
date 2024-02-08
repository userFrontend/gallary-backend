const router = require('express').Router();
const userCtrl = require('../controller/userCtrl');

router.get('/', userCtrl.get);
router.delete('/:id', userCtrl.delete);
router.put('/:id', userCtrl.update);

module.exports = router