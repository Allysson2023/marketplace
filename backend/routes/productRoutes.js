const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');
const { route } = require('./userRoutes');

router.post('/products', authMiddleware, (req, res) => {
    const { nome, preco, categoria } = req.body;
    const userId = req.user.id;
    const buscarLoja = "SELECT id FROM stores WHERE user_id = ?";

    db.query(buscarLoja, [userId], (err, lojaResult) => {
        if (err) {
            return res.status(500).json(err);
        }
        if (lojaResult.length === 0) {
            return res.status(404).json({
                message: "Loja não encontrada"
            });
        }

        const store_id = lojaResult[0].id;
        const sql = `
            INSERT INTO products
            (nome, preco, store_id, categoria)
            VALUES (?, ?, ?, ?)
        `;
        db.query(
            sql,
            [nome, preco, store_id, categoria],
            (err, result) => {
                if (err) {
                    return res.status(500).json(err);
                }
                res.json({
                    message: "Produto criado com sucesso!"
                });
            }
        );
    });
});

router.get('/products', (req, res) => {

    const sql = `
        SELECT * FROM products
        ORDER BY id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);

    });

});

router.get('/stores/:id/products', (req, res) => {

    const storeId = req.params.id;

    const sql = `
        SELECT * FROM products
        WHERE store_id = ?
    `;

    db.query(sql, [storeId], (err, result) => {

        if(err){
            return res.status(500).json(err);
        }

        res.json(result);

    });

});

module.exports = router;