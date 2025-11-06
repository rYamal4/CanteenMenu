// Роутер для главных страниц
const express = require('express');
const router = express.Router();
const homeController = require('../Controllers/homeController');

// Главная страница
router.get('/', homeController.getIndex);

// Страница "О программе"
router.get('/about', homeController.getAbout);

module.exports = router;
