// Модуль для подключения к базе данных PostgreSQL
const { Pool } = require('pg');

// Конфигурация подключения к базе данных
// Использует переменные окружения для Docker или значения по умолчанию для локального запуска
const pool = new Pool({
    user: process.env.DATABASE_USER || 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    database: process.env.DATABASE_NAME || 'canteen_db',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
});

// Проверка подключения к базе данных
pool.connect((err, client, release) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err.stack);
    } else {
        console.log('Успешное подключение к базе данных PostgreSQL');
        release();
    }
});

// Экспорт пула подключений для использования в других модулях
module.exports = pool;
