const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');
const { route } = require('./userRoutes');

router.post('/products', authMiddleware,  (req, res) => {
    const { nome, preco, store_id, categoria } = req.body;

    const sql = "INSERT INTO products (nome, preco, store_id, categoria) VALUES (?, ?, ?, ?)";

    db.query(sql, [nome, preco, store_id, categoria], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json({message: "Produto criado com sucesso!" });
    });
});

router.get('/products', (req, res) => {
    db.query("SELECT * FROM products", (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        
        res.json(result);
    });
});

module.exports = router;