// Роутер для работы с категориями
const express = require('express');
const router = express.Router();
const categoryController = require('../Controllers/categoryController');

// Получение списка категорий
router.get('/', categoryController.getCategories);

// Страница добавления новой категории
router.get('/add', categoryController.getAddCategory);

// Обработка добавления новой категории
router.post('/add', categoryController.postAddCategory);

// Страница редактирования категории
router.get('/:id/edit', categoryController.getEditCategory);

// Обработка редактирования категории
router.post('/:id/edit', categoryController.postEditCategory);

// Удаление категории
router.post('/:id/delete', categoryController.deleteCategory);

module.exports = router;
