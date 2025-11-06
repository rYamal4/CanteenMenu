// Главный файл приложения - Система управления меню столовой
// Лабораторная работа по теме "Создание меню для столовой"

// Подключение необходимых модулей
const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const path = require('path');

// Подключение базы данных
const pool = require('./db');

// Подключение роутеров
const homeRouter = require('./Routes/homeRouter');
const dishRouter = require('./Routes/dishRouter');
const categoryRouter = require('./Routes/categoryRouter');
const ingredientRouter = require('./Routes/ingredientRouter');

// Создание приложения Express
const app = express();
const PORT = 3000;

// Настройка шаблонизатора Handlebars
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'Views'));

// Регистрация папки для партиалов (частичных представлений)
hbs.registerPartials(path.join(__dirname, 'Views', 'partials'));

// Регистрация helper'а для сравнения значений в Handlebars
hbs.registerHelper('eq', function (a, b) {
    return a == b;
});

// Настройка middleware
app.use(bodyParser.urlencoded({ extended: true })); // Парсинг данных из форм
app.use(bodyParser.json()); // Парсинг JSON данных
app.use(express.static(path.join(__dirname, 'public'))); // Статические файлы (CSS, изображения)

// Подключение роутеров к приложению
app.use('/', homeRouter);            // Главная страница и "О программе"
app.use('/dishes', dishRouter);      // Работа с блюдами
app.use('/categories', categoryRouter); // Работа с категориями
app.use('/ingredients', ingredientRouter); // Работа с ингредиентами

// Обработка ошибки 404 - страница не найдена
app.use((req, res) => {
    res.status(404).render('Home/Index', {
        title: 'Страница не найдена',
        error: 'Запрашиваемая страница не существует'
    });
});

// Обработка ошибок сервера
app.use((err, req, res, next) => {
    console.error('Ошибка сервера:', err.stack);
    res.status(500).send('Внутренняя ошибка сервера');
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`===========================================`);
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log(`Система управления меню столовой`);
    console.log(`===========================================`);
});

// Обработка завершения работы приложения
process.on('SIGINT', async () => {
    console.log('\nЗавершение работы приложения...');
    await pool.end();
    console.log('Соединение с базой данных закрыто');
    process.exit(0);
});
