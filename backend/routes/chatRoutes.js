const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware");


// CRIAR CHAT
router.post("/criar", authMiddleware, (req, res) => {

    const cliente_id = req.user.id;
    const { loja_id, pedido_id } = req.body;

    const sql = `
        INSERT INTO chats (pedido_id, cliente_id, loja_id)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [pedido_id, cliente_id, loja_id], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.json({
            chatId: result.insertId
        });
    });
});



// LISTAR MENSAGENS
router.get("/:chatId/mensagens", authMiddleware, (req, res) => {

    const { chatId } = req.params;

    const sql = `
        SELECT *
        FROM mensagens
        WHERE chat_id = ?
        ORDER BY criado_em ASC
    `;

    db.query(sql, [chatId], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.json(result);
    });
});



module.exports = router;