// Контроллер для работы с ингредиентами
const pool = require('../db');

// Получение списка всех ингредиентов
exports.getIngredients = async (req, res) => {
    try {
        // Получаем все ингредиенты с подсчетом количества блюд, использующих их
        const query = `
            SELECT i.*, COUNT(di.dish_id) as usage_count
            FROM ingredients i
            LEFT JOIN dish_ingredients di ON i.id = di.ingredient_id
            GROUP BY i.id
            ORDER BY i.name
        `;

        const result = await pool.query(query);

        res.render('Ingredients/Ingredients', {
            title: 'Ингредиенты',
            ingredients: result.rows,
            activePage: 'ingredients'
        });
    } catch (err) {
        console.error('Ошибка при получении списка ингредиентов:', err);
        res.status(500).send('Ошибка сервера');
    }
};

// Страница добавления нового ингредиента
exports.getAddIngredient = (req, res) => {
    res.render('Ingredients/addIngredient', {
        title: 'Добавить ингредиент',
        activePage: 'ingredients'
    });
};

// Обработка добавления нового ингредиента
exports.postAddIngredient = async (req, res) => {
    const { name, unit } = req.body;

    try {
        const query = 'INSERT INTO ingredients (name, unit) VALUES ($1, $2)';
        await pool.query(query, [name, unit]);

        res.redirect('/ingredients');
    } catch (err) {
        console.error('Ошибка при добавлении ингредиента:', err);

        // Проверка на уникальность имени ингредиента
        if (err.code === '23505') {
            res.status(400).send('Ингредиент с таким названием уже существует');
        } else {
            res.status(500).send('Ошибка при добавлении ингредиента');
        }
    }
};

// Страница редактирования ингредиента
exports.getEditIngredient = async (req, res) => {
    try {
        const ingredientId = req.params.id;

        const result = await pool.query('SELECT * FROM ingredients WHERE id = $1', [ingredientId]);

        if (result.rows.length === 0) {
            return res.status(404).send('Ингредиент не найден');
        }

        res.render('Ingredients/editIngredient', {
            title: 'Редактировать ингредиент',
            ingredient: result.rows[0],
            activePage: 'ingredients'
        });
    } catch (err) {
        console.error('Ошибка при загрузке формы редактирования ингредиента:', err);
        res.status(500).send('Ошибка сервера');
    }
};

// Обработка редактирования ингредиента
exports.postEditIngredient = async (req, res) => {
    const ingredientId = req.params.id;
    const { name, unit } = req.body;

    try {
        const query = 'UPDATE ingredients SET name = $1, unit = $2 WHERE id = $3';
        await pool.query(query, [name, unit, ingredientId]);

        res.redirect('/ingredients');
    } catch (err) {
        console.error('Ошибка при редактировании ингредиента:', err);

        // Проверка на уникальность имени ингредиента
        if (err.code === '23505') {
            res.status(400).send('Ингредиент с таким названием уже существует');
        } else {
            res.status(500).send('Ошибка при редактировании ингредиента');
        }
    }
};

// Удаление ингредиента
exports.deleteIngredient = async (req, res) => {
    const ingredientId = req.params.id;

    try {
        // Проверяем, используется ли ингредиент в блюдах
        const checkResult = await pool.query(
            'SELECT COUNT(*) FROM dish_ingredients WHERE ingredient_id = $1',
            [ingredientId]
        );

        const usageCount = parseInt(checkResult.rows[0].count);

        if (usageCount > 0) {
            return res.status(400).send(
                `Невозможно удалить ингредиент, так как он используется в ${usageCount} блюдах. Сначала удалите его из блюд.`
            );
        }

        // Удаляем ингредиент
        await pool.query('DELETE FROM ingredients WHERE id = $1', [ingredientId]);
        res.redirect('/ingredients');
    } catch (err) {
        console.error('Ошибка при удалении ингредиента:', err);
        res.status(500).send('Ошибка при удалении ингредиента');
    }
};
