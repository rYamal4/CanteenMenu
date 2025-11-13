const express = require('express');
const router = express.Router();
const dishController = require('../Controllers/dishController');

router.get('/', dishController.getDishes);

router.get('/add', dishController.getAddDish);

router.post('/add', dishController.postAddDish);

router.get('/:id/details', dishController.getDishDetails);

router.get('/:id/edit', dishController.getEditDish);

router.post('/:id/edit', dishController.postEditDish);

router.post('/:id/delete', dishController.deleteDish);

module.exports = router;
