const express = require('express');
const router = express.Router();
const db = require('../config/db');

const jwt = require('jsonwebtoken');

const authMiddleware = require('../middlewares/authMiddleware');

router.post('/users', (req, res) => {
    const {username, password, tipo} = req.body;

    const sql = "INSERT INTO users (username, password, tipo) VALUES (?, ?,?)";

    db.query(sql, [username, password, tipo], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        res.json({ message: "Usuário criado! "});
    });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";

    db.query(sql, [username, password], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        if(result.length > 0) {
            const user = result[0];

            const token = jwt.sign(
                { id: user.id, username: user.username },
                "segredo_super",
                { expiresIn: "30d"}
            );
            res.json({
                message: "Login feito com sucesso!",
                token: token
            });
        } else {
            res.status(401).json({ message: "Usuário ou senha inválidos "});
        }
    });
});

router.get('/users', (req, res) => {
    db.query("SELECT * FROM users", (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

router.get('/perfil', authMiddleware, (req, res) => {
    res.json({
        message: "Voce está logado!",
        user: req.user
    });
});

router.put('/update-profile', authMiddleware, (req, res) => {

    const {
        username,
        nomeLoja,
        categoria
    } = req.body;

    const userId = req.user.id;

    const sql = `
        UPDATE users
        SET username = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [username, userId],
        (err, result) => {

            if(err){
                return res.status(500).json(err);
            }

            const sqlLoja = `
                UPDATE stores
                SET nome = ?, categoria = ?
                WHERE user_id = ?
            `;

            db.query(
                sqlLoja,
                [nomeLoja, categoria, userId]
            );

            res.json({
                message: "Perfil atualizado!"
            });

        }
    );

});

router.get('/profile', authMiddleware, (req, res) => {

    const userId = req.user.id;

    const sql = `
        SELECT
            users.username,
            stores.nome AS nomeLoja,
            stores.categoria
        FROM users
        LEFT JOIN stores
        ON users.id = stores.user_id
        WHERE users.id = ?
    `;

    db.query(sql, [userId], (err, result) => {

        if(err){
            return res.status(500).json(err);
        }

        res.json(result[0]);

    });

});

module.exports = router