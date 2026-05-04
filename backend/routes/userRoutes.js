const express = require('express');
const router = express.Router();
const db = require('../config/db');

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

router.get('/users', (req, res) => {
    db.query("SELECT * FROM users", (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

module.exports = router