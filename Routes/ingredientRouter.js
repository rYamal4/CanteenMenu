const express = require('express');
const router = express.Router();
const ingredientController = require('../Controllers/ingredientController');

router.get('/', ingredientController.getIngredients);

router.get('/add', ingredientController.getAddIngredient);

router.post('/add', ingredientController.postAddIngredient);

router.get('/:id/edit', ingredientController.getEditIngredient);

router.post('/:id/edit', ingredientController.postEditIngredient);

router.post('/:id/delete', ingredientController.deleteIngredient);

module.exports = router;
