const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadLojas');

const SECRET = "segredo_super";


// ===============================
// CRIAR USUÁRIO
// ===============================
router.post('/users', (req, res) => {

    const { username, password } = req.body;

    const tipo = "cliente";

    const sql = `
        INSERT INTO users (username, password, tipo)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [username, password, tipo],
        (err) => {

            if (err) {

                console.log(err);

                return res
                    .status(500)
                    .json(err);

            }

            res.json({
                message:
                    "Conta criada com sucesso!"
            });

        }
    );

});


// ===============================
// LOGIN (CORRIGIDO)
// ===============================
router.post('/login', (req, res) => {

    const { username, password } = req.body;

    const sql = `
        SELECT 
            users.id,
            users.username,
            users.tipo,
            stores.id AS loja_id
        FROM users
        LEFT JOIN stores 
            ON stores.user_id = users.id
        WHERE users.username = ? 
        AND users.password = ?
        LIMIT 1
    `;

    db.query(sql, [username, password], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(401).json({ error: "Usuário ou senha inválidos" });
        }

        const user = result[0];

        const token = jwt.sign(
            { id: user.id },
            SECRET,
            { expiresIn: "23h" }
        );

        res.json({
            message: "Login feito com sucesso!",
            token,
            user: {
                id: user.id,
                username: user.username,
                tipo: user.tipo,
                loja_id: user.loja_id || null
            }
        });

    });

});


// ===============================
// LISTAR USUÁRIOS
// ===============================
router.get('/users', authMiddleware,  (req, res) => {

    db.query("SELECT * FROM users", (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);

    });

});

// ===============================
// BUSCAR USUÁRIO POR ID
// ===============================
router.get('/users/:id', authMiddleware, (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            id,
            username
        FROM users
        WHERE id = ?
        LIMIT 1
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(404).json({
                error: "Usuário não encontrado"
            });
        }

        res.json(result[0]);

    });

});

// ===============================
// ATUALIZAR USUÁRIO
// ===============================
router.put('/users/:id', authMiddleware,(req, res) => {
    const userIdLogado = req.user.id;
const { id } = req.params;

if (Number(id) !== Number(userIdLogado)) {
    return res.status(403).json({
        error: "Você não tem permissão para alterar este usuário"
    });
}

    const {
        username,
        password
    } = req.body;

    let sql;
    let valores;

    if (password) {

        sql = `
            UPDATE users
            SET username = ?, password = ?
            WHERE id = ?
        `;

        valores = [
            username,
            password,
            id
        ];

    } else {

        sql = `
            UPDATE users
            SET username = ?
            WHERE id = ?
        `;

        valores = [
            username,
            id
        ];

    }

    db.query(sql, valores, (err) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json({
            message: "Usuário atualizado com sucesso"
        });

    });

});


// ===============================
// PERFIL LOGADO
// ===============================
router.get('/perfil', authMiddleware, (req, res) => {

    res.json({
        message: "Você está logado!",
        user: req.user
    });

});


// ===============================
// PEGAR PERFIL COMPLETO
// ===============================
router.get('/profile', authMiddleware, (req, res) => {

    const userId = req.user.id;

    const sql = `
        SELECT 
            users.id,
            users.username,
            stores.nome AS nomeLoja,
            stores.categoria,
            stores.imagem
        FROM users
        LEFT JOIN stores 
            ON users.id = stores.user_id
        WHERE users.id = ?
        LIMIT 1
    `;

    db.query(sql, [userId], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result[0]);

    });

});


// ===============================
// ATUALIZAR PERFIL + LOJA
// ===============================
router.put('/update-profile', authMiddleware, upload.single('imagem'), (req, res) => {

    const userId = req.user.id;
    const { username, nomeLoja, categoria } = req.body;
    const imagem = req.file ? req.file.filename : null;

    // atualizar user
    const sqlUser = `
        UPDATE users 
        SET username = ? 
        WHERE id = ?
    `;

    db.query(sqlUser, [username, userId], (err) => {

        if (err) {
            return res.status(500).json(err);
        }

        // verificar se loja existe
        db.query(
            "SELECT id FROM stores WHERE user_id = ?",
            [userId],
            (err2, result) => {

                if (err2) {
                    return res.status(500).json(err2);
                }

                // se não existe loja, cria
                if (result.length === 0) {

                    const sqlInsert = `
                        INSERT INTO stores 
                        (user_id, nome, categoria, imagem)
                        VALUES (?, ?, ?, ?)
                    `;

                    db.query(sqlInsert, [
                        userId,
                        nomeLoja,
                        categoria,
                        imagem
                    ], (err3) => {

                        if (err3) {
                            return res.status(500).json(err3);
                        }

                        return res.json({
                            message: "Perfil e loja criados com sucesso"
                        });

                    });

                } else {

                    // atualiza loja existente
                    let sqlStore;
                    let valores;

                    if (imagem) {

                        sqlStore = `
                            UPDATE stores 
                            SET nome = ?, categoria = ?, imagem = ?
                            WHERE user_id = ?
                        `;

                        valores = [
                            nomeLoja,
                            categoria,
                            imagem,
                            userId
                        ];

                    } else {

                        sqlStore = `
                            UPDATE stores 
                            SET nome = ?, categoria = ?
                            WHERE user_id = ?
                        `;

                        valores = [
                            nomeLoja,
                            categoria,
                            userId
                        ];

                    }

                    db.query(sqlStore, valores, (err4) => {

                        if (err4) {
                            return res.status(500).json(err4);
                        }

                        res.json({
                            message: "Perfil atualizado com sucesso"
                        });

                    });

                }

            }
        );

    });

});

module.exports = router;