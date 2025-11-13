const express = require('express');
const router = express.Router();
const categoryController = require('../Controllers/categoryController');

router.get('/', categoryController.getCategories);

router.get('/add', categoryController.getAddCategory);

router.post('/add', categoryController.postAddCategory);

router.get('/:id/edit', categoryController.getEditCategory);

router.post('/:id/edit', categoryController.postEditCategory);

router.post('/:id/delete', categoryController.deleteCategory);

module.exports = router;
