// Роутер для работы с ингредиентами
const express = require('express');
const router = express.Router();
const ingredientController = require('../Controllers/ingredientController');

// Получение списка ингредиентов
router.get('/', ingredientController.getIngredients);

// Страница добавления нового ингредиента
router.get('/add', ingredientController.getAddIngredient);

// Обработка добавления нового ингредиента
router.post('/add', ingredientController.postAddIngredient);

// Страница редактирования ингредиента
router.get('/:id/edit', ingredientController.getEditIngredient);

// Обработка редактирования ингредиента
router.post('/:id/edit', ingredientController.postEditIngredient);

// Удаление ингредиента
router.post('/:id/delete', ingredientController.deleteIngredient);

module.exports = router;
