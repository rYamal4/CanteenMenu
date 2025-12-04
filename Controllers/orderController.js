const pool = require('../db');

// Place order (create from cart)
exports.placeOrder = async (req, res) => {
    const client = await pool.connect();

    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).send('Пользователь не авторизован');
        }

        await client.query('BEGIN');

        // Get cart items
        const cartResult = await client.query(`
            SELECT
                ci.id as cart_item_id,
                ci.quantity,
                d.id as dish_id,
                d.name as dish_name,
                d.price,
                d.is_available,
                (ci.quantity * d.price) as subtotal
            FROM cart_items ci
            JOIN dishes d ON ci.dish_id = d.id
            WHERE ci.user_id = $1
        `, [userId]);

        const cartItems = cartResult.rows;

        if (cartItems.length === 0) {
            await client.query('ROLLBACK');
            return res.redirect('/cart');
        }

        // Check if all items are available
        const unavailableItems = cartItems.filter(item => !item.is_available);
        if (unavailableItems.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).send('Некоторые блюда в корзине недоступны. Пожалуйста, удалите их.');
        }

        // Calculate total
        const total = cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

        // Create order
        const orderResult = await client.query(
            'INSERT INTO orders (user_id, total_amount) VALUES ($1, $2) RETURNING id',
            [userId, total]
        );

        const orderId = orderResult.rows[0].id;

        // Create order items
        for (const item of cartItems) {
            await client.query(
                `INSERT INTO order_items (order_id, dish_id, dish_name, quantity, price_at_purchase)
                 VALUES ($1, $2, $3, $4, $5)`,
                [orderId, item.dish_id, item.dish_name, item.quantity, item.price]
            );
        }

        // Clear cart
        await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

        await client.query('COMMIT');

        // Redirect to orders page
        res.redirect('/orders');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Ошибка при оформлении заказа:', err);
        res.status(500).send('Ошибка при оформлении заказа');
    } finally {
        client.release();
    }
};

// Get order history
exports.getOrders = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).send('Пользователь не авторизован');
        }

        // Get all orders for user
        const ordersResult = await pool.query(`
            SELECT
                o.id,
                o.total_amount,
                o.created_at,
                COUNT(oi.id) as items_count
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = $1
            GROUP BY o.id, o.total_amount, o.created_at
            ORDER BY o.created_at DESC
        `, [userId]);

        const orders = ordersResult.rows;

        // For each order, get items
        for (let order of orders) {
            const itemsResult = await pool.query(`
                SELECT
                    dish_name,
                    quantity,
                    price_at_purchase,
                    (quantity * price_at_purchase) as subtotal
                FROM order_items
                WHERE order_id = $1
                ORDER BY id
            `, [order.id]);

            order.items = itemsResult.rows;
        }

        res.render('Orders/Orders', {
            title: 'Мои заказы',
            orders: orders,
            activePage: 'orders'
        });
    } catch (err) {
        console.error('Ошибка при получении заказов:', err);
        res.status(500).send('Ошибка сервера');
    }
};
