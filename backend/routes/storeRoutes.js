const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/stores', authMiddleware, (req, res) => {
    const { nome } = req.body;
    const userId = req.user.id;

    const sql = "INSERT INTO stores (nome, user_id) VALUES (?, ?)";

    db.query(sql, [nome, userId], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json({ message: "Loja criadacom sucesso!" });
    });
});

router.get('/stores', (req, res) => {
    db.query("SELECT * FROM stores", (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);
    });
});

module.exports = router;