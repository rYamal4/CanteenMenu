const pool = require('../db');

exports.getDishes = async (req, res) => {
    try {
        const categoryId = req.query.category_id;

        let query;
        let params = [];
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
            query = `
                SELECT d.*, c.name as category_name
                FROM dishes d
                JOIN categories c ON d.category_id = c.id
                ORDER BY c.name, d.name
            `;
        }

        const dishesResult = await pool.query(query, params);

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

exports.getAddDish = async (req, res) => {
    try {
        const categoriesResult = await pool.query('SELECT * FROM categories ORDER BY name');
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

exports.postAddDish = async (req, res) => {
    const { name, category_id, description, price, weight, is_available, ingredients } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

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

        await client.query('COMMIT');

        res.redirect('/dishes');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Ошибка при добавлении блюда:', err);
        res.status(500).send('Ошибка при добавлении блюда');
    } finally {
        client.release();
    }
};

exports.getEditDish = async (req, res) => {
    try {
        const dishId = req.params.id;

        const dishResult = await pool.query('SELECT * FROM dishes WHERE id = $1', [dishId]);

        if (dishResult.rows.length === 0) {
            return res.status(404).send('Блюдо не найдено');
        }

        const categoriesResult = await pool.query('SELECT * FROM categories ORDER BY name');

        const allIngredientsResult = await pool.query('SELECT * FROM ingredients ORDER BY name');

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

exports.postEditDish = async (req, res) => {
    const dishId = req.params.id;
    const { name, category_id, description, price, weight, is_available, ingredients } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

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

        await client.query('DELETE FROM dish_ingredients WHERE dish_id = $1', [dishId]);

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

        await client.query('COMMIT');

        res.redirect('/dishes');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Ошибка при редактировании блюда:', err);
        res.status(500).send('Ошибка при редактировании блюда');
    } finally {
        client.release();
    }
};

exports.deleteDish = async (req, res) => {
    const dishId = req.params.id;

    try {
        await pool.query('DELETE FROM dishes WHERE id = $1', [dishId]);
        res.redirect('/dishes');
    } catch (err) {
        console.error('Ошибка при удалении блюда:', err);
        res.status(500).send('Ошибка при удалении блюда');
    }
};

exports.getDishDetails = async (req, res) => {
    try {
        const dishId = req.params.id;

        const dishResult = await pool.query(`
            SELECT d.*, c.name as category_name
            FROM dishes d
            JOIN categories c ON d.category_id = c.id
            WHERE d.id = $1
        `, [dishId]);

        if (dishResult.rows.length === 0) {
            return res.status(404).send('Блюдо не найдено');
        }

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
