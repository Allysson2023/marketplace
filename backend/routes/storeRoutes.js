const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/stores', authMiddleware, (req, res) => {
    const { nome, categoria } = req.body;
    const userId = req.user.id;

    const sql = `
        INSERT INTO stores
        (nome, user_id, categoria)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [nome, userId, categoria],
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }
            res.json({
                message: "Loja criada com sucesso!"
            });
        }
    );
});

router.get('/minha-loja', authMiddleware, (req, res) => {
    const userId = req.user.id;
    const sql = "SELECT * FROM stores WHERE user_id = ?";

    db.query(sql, [userId], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        if(result.length > 0){
            return res.json({
                existe: true
            });
        }
        res.json({
            existe: false
        });
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