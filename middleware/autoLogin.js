const pool = require('../db');

const autoLogin = async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT id, first_name, last_name, email FROM users ORDER BY id LIMIT 1'
        );

        if (result.rows.length > 0) {
            const user = result.rows[0];
            req.session.userId = user.id;
            res.locals.currentUser = user;

            // Получить количество товаров в корзине для badge
            const cartResult = await pool.query(
                'SELECT COALESCE(SUM(quantity), 0) as count FROM cart_items WHERE user_id = $1',
                [user.id]
            );
            res.locals.cartCount = parseInt(cartResult.rows[0].count);
        }

        next();
    } catch (err) {
        console.error('Error in autoLogin middleware:', err);
        next(err);
    }
};

module.exports = autoLogin;
