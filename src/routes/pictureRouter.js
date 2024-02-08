const router = require('express').Router();
const pictureCtrl = require('../controller/pictureCrtl');

router.post('/', pictureCtrl.add);
router.get('/', pictureCtrl.get);
router.delete('/:id', pictureCtrl.delete);
router.put('/:id', pictureCtrl.update);

module.exports = router