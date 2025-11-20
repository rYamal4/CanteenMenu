const express = require('express');
const bodyParser = require('body-parser');
const { engine } = require('express-handlebars');
const path = require('path');

const pool = require('./db');

const homeRouter = require('./Routes/homeRouter');
const dishRouter = require('./Routes/dishRouter');
const categoryRouter = require('./Routes/categoryRouter');
const ingredientRouter = require('./Routes/ingredientRouter');

const app = express();
const PORT = 3000;

// Настройка Handlebars
app.engine('hbs', engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'Views', 'layouts'),
    partialsDir: path.join(__dirname, 'Views', 'partials'),
    helpers: {
        eq: function (a, b) {
            return a == b;
        }
    }
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'Views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', homeRouter);
app.use('/dishes', dishRouter);
app.use('/categories', categoryRouter);
app.use('/ingredients', ingredientRouter);

app.use((req, res) => {
    res.status(404).render('Home/Index', {
        title: 'Страница не найдена',
        error: 'Запрашиваемая страница не существует'
    });
});

app.use((err, req, res, next) => {
    console.error('Ошибка сервера:', err.stack);
    res.status(500).send('Внутренняя ошибка сервера');
});

app.listen(PORT, () => {
    console.log(`===========================================`);
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log(`Система управления меню столовой`);
    console.log(`===========================================`);
});

process.on('SIGINT', async () => {
    console.log('\nЗавершение работы приложения...');
    await pool.end();
    console.log('Соединение с базой данных закрыто');
    process.exit(0);
});
