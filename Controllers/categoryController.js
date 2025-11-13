const pool = require('../db');

exports.getCategories = async (req, res) => {
    try {
        const query = `
            SELECT c.*, COUNT(d.id) as dish_count
            FROM categories c
            LEFT JOIN dishes d ON c.id = d.category_id
            GROUP BY c.id
            ORDER BY c.name
        `;

        const result = await pool.query(query);

        res.render('Categories/Categories', {
            title: 'Категории блюд',
            categories: result.rows,
            activePage: 'categories'
        });
    } catch (err) {
        console.error('Ошибка при получении списка категорий:', err);
        res.status(500).send('Ошибка сервера');
    }
};

exports.getAddCategory = (req, res) => {
    res.render('Categories/addCategory', {
        title: 'Добавить категорию',
        activePage: 'categories'
    });
};

exports.postAddCategory = async (req, res) => {
    const { name, description } = req.body;

    try {
        const query = 'INSERT INTO categories (name, description) VALUES ($1, $2)';
        await pool.query(query, [name, description || null]);

        res.redirect('/categories');
    } catch (err) {
        console.error('Ошибка при добавлении категории:', err);

        if (err.code === '23505') {
            res.status(400).send('Категория с таким названием уже существует');
        } else {
            res.status(500).send('Ошибка при добавлении категории');
        }
    }
};

exports.getEditCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;

        const result = await pool.query('SELECT * FROM categories WHERE id = $1', [categoryId]);

        if (result.rows.length === 0) {
            return res.status(404).send('Категория не найдена');
        }

        res.render('Categories/editCategory', {
            title: 'Редактировать категорию',
            category: result.rows[0],
            activePage: 'categories'
        });
    } catch (err) {
        console.error('Ошибка при загрузке формы редактирования категории:', err);
        res.status(500).send('Ошибка сервера');
    }
};

exports.postEditCategory = async (req, res) => {
    const categoryId = req.params.id;
    const { name, description } = req.body;

    try {
        const query = 'UPDATE categories SET name = $1, description = $2 WHERE id = $3';
        await pool.query(query, [name, description || null, categoryId]);

        res.redirect('/categories');
    } catch (err) {
        console.error('Ошибка при редактировании категории:', err);

        if (err.code === '23505') {
            res.status(400).send('Категория с таким названием уже существует');
        } else {
            res.status(500).send('Ошибка при редактировании категории');
        }
    }
};

exports.deleteCategory = async (req, res) => {
    const categoryId = req.params.id;

    try {
        const checkResult = await pool.query(
            'SELECT COUNT(*) FROM dishes WHERE category_id = $1',
            [categoryId]
        );

        const dishCount = parseInt(checkResult.rows[0].count);

        if (dishCount > 0) {
            return res.status(400).send(
                `Невозможно удалить категорию, так как в ней есть блюда (${dishCount} шт.). Сначала удалите или переместите блюда.`
            );
        }

        await pool.query('DELETE FROM categories WHERE id = $1', [categoryId]);
        res.redirect('/categories');
    } catch (err) {
        console.error('Ошибка при удалении категории:', err);
        res.status(500).send('Ошибка при удалении категории');
    }
};
