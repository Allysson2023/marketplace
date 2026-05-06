const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/cart', authMiddleware, (req, res) => {
    const userId = req.user.id;
    const { product_id, quantidade } = req.body;

    db.query("SELECT * FROM cart WHERE user_id = ?", [userId], (err, cartResult) => {
        if (err) return res.status(500).json(err);

        if (cartResult.length === 0) {
            db.query("INSERT INTO cart (user_id) VALUES (?)", [userId], (err, result) => {
                if (err) return res.status(500).json(err);

                const cartId = result.insertId;

                adicionarItem(cartId);
            });
        } else {
            const cartId = cartResult[0].id;
            adicionarItem(cartId);
        }

        function adicionarItem(cartId) {
            const sql = "INSERT INTO cart_items (cart_id, product_id, quantidade) VALUES (?, ?, ?)";

            db.query(sql, [cartId, product_id, quantidade], (err) => {
                if (err) return res.status(500).json(err);
                res.json({ message: "Produto adicionado ao carrinho!" });
            });
        }
    });
});

router.get('/cart', authMiddleware, (req, res) =>{
    const userId = req.user.id;

    const sql = `
        SELECT products.nome, products.preco, cart_items.quantidade
        FROM cart_items
        JOIN cart ON cart.id = cart_items.cart_id
        JOIN products ON products.id = cart_items.product_id
        WHERE cart.user_id = ?
    `;
    
    db.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).json(err);

        res.json(result);
    });
});

module.exports = router;