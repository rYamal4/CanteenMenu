const pool = require('../db');

// Get cart for current user
exports.getCart = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).send('Пользователь не авторизован');
        }

        // Get cart items with dish details
        const cartResult = await pool.query(`
            SELECT
                ci.id,
                ci.quantity,
                d.id as dish_id,
                d.name as dish_name,
                d.price,
                d.image_url,
                d.is_available,
                (ci.quantity * d.price) as subtotal
            FROM cart_items ci
            JOIN dishes d ON ci.dish_id = d.id
            WHERE ci.user_id = $1
            ORDER BY ci.added_at DESC
        `, [userId]);

        const cartItems = cartResult.rows;

        // Calculate total
        const total = cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

        res.render('Cart/Cart', {
            title: 'Корзина',
            cartItems: cartItems,
            total: total.toFixed(2),
            activePage: 'cart'
        });
    } catch (err) {
        console.error('Ошибка при получении корзины:', err);
        res.status(500).send('Ошибка сервера');
    }
};

// Add item to cart
exports.addToCart = async (req, res) => {
    try {
        const userId = req.session.userId;
        const dishId = req.body.dish_id;
        const quantity = parseInt(req.body.quantity) || 1;

        if (!userId) {
            return res.status(401).send('Пользователь не авторизован');
        }

        // Check if dish exists and is available
        const dishResult = await pool.query(
            'SELECT id, is_available FROM dishes WHERE id = $1',
            [dishId]
        );

        if (dishResult.rows.length === 0) {
            return res.status(404).send('Блюдо не найдено');
        }

        if (!dishResult.rows[0].is_available) {
            return res.status(400).send('Блюдо недоступно для заказа');
        }

        // Check if item already in cart
        const existingItem = await pool.query(
            'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND dish_id = $2',
            [userId, dishId]
        );

        if (existingItem.rows.length > 0) {
            // Update quantity
            await pool.query(
                'UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2',
                [quantity, existingItem.rows[0].id]
            );
        } else {
            // Insert new item
            await pool.query(
                'INSERT INTO cart_items (user_id, dish_id, quantity) VALUES ($1, $2, $3)',
                [userId, dishId, quantity]
            );
        }

        // Redirect based on referer or to cart
        const referer = req.get('Referer');
        if (referer && referer.includes('/dishes/')) {
            res.redirect(referer);
        } else {
            res.redirect('/cart');
        }
    } catch (err) {
        console.error('Ошибка при добавлении в корзину:', err);
        res.status(500).send('Ошибка сервера');
    }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
    try {
        const userId = req.session.userId;
        const itemId = req.params.id;
        const quantity = parseInt(req.body.quantity);

        if (!userId) {
            return res.status(401).send('Пользователь не авторизован');
        }

        if (quantity < 1) {
            return res.status(400).send('Количество должно быть больше 0');
        }

        // Update only if item belongs to user
        await pool.query(
            'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3',
            [quantity, itemId, userId]
        );

        res.redirect('/cart');
    } catch (err) {
        console.error('Ошибка при обновлении корзины:', err);
        res.status(500).send('Ошибка сервера');
    }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.session.userId;
        const itemId = req.params.id;

        if (!userId) {
            return res.status(401).send('Пользователь не авторизован');
        }

        // Delete only if item belongs to user
        await pool.query(
            'DELETE FROM cart_items WHERE id = $1 AND user_id = $2',
            [itemId, userId]
        );

        res.redirect('/cart');
    } catch (err) {
        console.error('Ошибка при удалении из корзины:', err);
        res.status(500).send('Ошибка сервера');
    }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).send('Пользователь не авторизован');
        }

        await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

        res.redirect('/cart');
    } catch (err) {
        console.error('Ошибка при очистке корзины:', err);
        res.status(500).send('Ошибка сервера');
    }
};
