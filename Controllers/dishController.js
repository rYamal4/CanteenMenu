// Контроллер для работы с блюдами
const pool = require('../db');

// Получение списка всех блюд с возможностью фильтрации по категории
exports.getDishes = async (req, res) => {
    try {
        const categoryId = req.query.category_id; // получаем ID категории из параметров запроса

        let query;
        let params = [];

        // Если указана категория, фильтруем по ней
        if (categoryId) {
            query = `
                SELECT d.*, c.name as category_name
                FROM dishes d
                JOIN categories c ON d.category_id = c.id
                WHERE d.category_id = $1
                ORDER BY d.name
            `;
            params = [categoryId];
        } else {
            // Иначе выводим все блюда
            query = `
                SELECT d.*, c.name as category_name
                FROM dishes d
                JOIN categories c ON d.category_id = c.id
                ORDER BY c.name, d.name
            `;
        }

        const dishesResult = await pool.query(query, params);

        // Получаем список всех категорий для фильтра
        const categoriesResult = await pool.query('SELECT * FROM categories ORDER BY name');

        res.render('Dishes/Dishes', {
            title: 'Меню столовой',
            dishes: dishesResult.rows,
            categories: categoriesResult.rows,
            selectedCategory: categoryId,
            activePage: 'dishes'
        });
    } catch (err) {
        console.error('Ошибка при получении списка блюд:', err);
        res.status(500).send('Ошибка сервера');
    }
};

// Страница добавления нового блюда
exports.getAddDish = async (req, res) => {
    try {
        // Получаем список категорий для выпадающего списка
        const categoriesResult = await pool.query('SELECT * FROM categories ORDER BY name');
        // Получаем список ингредиентов
        const ingredientsResult = await pool.query('SELECT * FROM ingredients ORDER BY name');

        res.render('Dishes/addDish', {
            title: 'Добавить блюдо',
            categories: categoriesResult.rows,
            ingredients: ingredientsResult.rows,
            activePage: 'dishes'
        });
    } catch (err) {
        console.error('Ошибка при загрузке формы добавления блюда:', err);
        res.status(500).send('Ошибка сервера');
    }
};

// Обработка добавления нового блюда
exports.postAddDish = async (req, res) => {
    const { name, category_id, description, price, weight, is_available, ingredients } = req.body;

    const client = await pool.connect();

    try {
        // Начинаем транзакцию
        await client.query('BEGIN');

        // Вставляем блюдо
        const insertQuery = `
            INSERT INTO dishes (name, category_id, description, price, weight, is_available)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `;
        const values = [
            name,
            category_id,
            description || null,
            parseFloat(price),
            weight ? parseInt(weight) : null,
            is_available === 'on' ? true : false
        ];

        const result = await client.query(insertQuery, values);
        const dishId = result.rows[0].id;

        // Добавляем ингредиенты, если они указаны
        if (ingredients && Array.isArray(ingredients)) {
            for (let ingredient of ingredients) {
                if (ingredient.ingredient_id && ingredient.quantity) {
                    await client.query(
                        'INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES ($1, $2, $3)',
                        [dishId, ingredient.ingredient_id, parseFloat(ingredient.quantity)]
                    );
                }
            }
        }

        // Фиксируем транзакцию
        await client.query('COMMIT');

        res.redirect('/dishes');
    } catch (err) {
        // Откатываем транзакцию в случае ошибки
        await client.query('ROLLBACK');
        console.error('Ошибка при добавлении блюда:', err);
        res.status(500).send('Ошибка при добавлении блюда');
    } finally {
        client.release();
    }
};

// Страница редактирования блюда
exports.getEditDish = async (req, res) => {
    try {
        const dishId = req.params.id;

        // Получаем данные блюда
        const dishResult = await pool.query('SELECT * FROM dishes WHERE id = $1', [dishId]);

        if (dishResult.rows.length === 0) {
            return res.status(404).send('Блюдо не найдено');
        }

        // Получаем список категорий
        const categoriesResult = await pool.query('SELECT * FROM categories ORDER BY name');

        // Получаем список всех ингредиентов
        const allIngredientsResult = await pool.query('SELECT * FROM ingredients ORDER BY name');

        // Получаем ингредиенты текущего блюда
        const dishIngredientsResult = await pool.query(`
            SELECT di.*, i.name, i.unit
            FROM dish_ingredients di
            JOIN ingredients i ON di.ingredient_id = i.id
            WHERE di.dish_id = $1
        `, [dishId]);

        res.render('Dishes/editDish', {
            title: 'Редактировать блюдо',
            dish: dishResult.rows[0],
            categories: categoriesResult.rows,
            allIngredients: allIngredientsResult.rows,
            dishIngredients: dishIngredientsResult.rows,
            activePage: 'dishes'
        });
    } catch (err) {
        console.error('Ошибка при загрузке формы редактирования:', err);
        res.status(500).send('Ошибка сервера');
    }
};

// Обработка редактирования блюда
exports.postEditDish = async (req, res) => {
    const dishId = req.params.id;
    const { name, category_id, description, price, weight, is_available, ingredients } = req.body;

    const client = await pool.connect();

    try {
        // Начинаем транзакцию
        await client.query('BEGIN');

        // Обновляем данные блюда
        const updateQuery = `
            UPDATE dishes
            SET name = $1, category_id = $2, description = $3,
                price = $4, weight = $5, is_available = $6
            WHERE id = $7
        `;
        const values = [
            name,
            category_id,
            description || null,
            parseFloat(price),
            weight ? parseInt(weight) : null,
            is_available === 'on' ? true : false,
            dishId
        ];

        await client.query(updateQuery, values);

        // Удаляем старые связи с ингредиентами
        await client.query('DELETE FROM dish_ingredients WHERE dish_id = $1', [dishId]);

        // Добавляем новые ингредиенты
        if (ingredients && Array.isArray(ingredients)) {
            for (let ingredient of ingredients) {
                if (ingredient.ingredient_id && ingredient.quantity) {
                    await client.query(
                        'INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES ($1, $2, $3)',
                        [dishId, ingredient.ingredient_id, parseFloat(ingredient.quantity)]
                    );
                }
            }
        }

        // Фиксируем транзакцию
        await client.query('COMMIT');

        res.redirect('/dishes');
    } catch (err) {
        // Откатываем транзакцию в случае ошибки
        await client.query('ROLLBACK');
        console.error('Ошибка при редактировании блюда:', err);
        res.status(500).send('Ошибка при редактировании блюда');
    } finally {
        client.release();
    }
};

// Удаление блюда
exports.deleteDish = async (req, res) => {
    const dishId = req.params.id;

    try {
        // Удаляем блюдо (связанные записи удалятся автоматически из-за CASCADE)
        await pool.query('DELETE FROM dishes WHERE id = $1', [dishId]);
        res.redirect('/dishes');
    } catch (err) {
        console.error('Ошибка при удалении блюда:', err);
        res.status(500).send('Ошибка при удалении блюда');
    }
};

// Просмотр деталей блюда
exports.getDishDetails = async (req, res) => {
    try {
        const dishId = req.params.id;

        // Получаем данные блюда с категорией
        const dishResult = await pool.query(`
            SELECT d.*, c.name as category_name
            FROM dishes d
            JOIN categories c ON d.category_id = c.id
            WHERE d.id = $1
        `, [dishId]);

        if (dishResult.rows.length === 0) {
            return res.status(404).send('Блюдо не найдено');
        }

        // Получаем ингредиенты блюда
        const ingredientsResult = await pool.query(`
            SELECT i.name, i.unit, di.quantity
            FROM dish_ingredients di
            JOIN ingredients i ON di.ingredient_id = i.id
            WHERE di.dish_id = $1
            ORDER BY i.name
        `, [dishId]);

        res.render('Dishes/dishDetails', {
            title: dishResult.rows[0].name,
            dish: dishResult.rows[0],
            ingredients: ingredientsResult.rows,
            activePage: 'dishes'
        });
    } catch (err) {
        console.error('Ошибка при получении деталей блюда:', err);
        res.status(500).send('Ошибка сервера');
    }
};
