// Роутер для работы с блюдами
const express = require('express');
const router = express.Router();
const dishController = require('../Controllers/dishController');

// Получение списка блюд (с возможностью фильтрации)
router.get('/', dishController.getDishes);

// Страница добавления нового блюда
router.get('/add', dishController.getAddDish);

// Обработка добавления нового блюда
router.post('/add', dishController.postAddDish);

// Просмотр деталей блюда
router.get('/:id/details', dishController.getDishDetails);

// Страница редактирования блюда
router.get('/:id/edit', dishController.getEditDish);

// Обработка редактирования блюда
router.post('/:id/edit', dishController.postEditDish);

// Удаление блюда
router.post('/:id/delete', dishController.deleteDish);

module.exports = router;
