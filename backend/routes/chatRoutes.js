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

const { getIo } = require("../utils/socket");

router.post("/mensagem", authMiddleware, (req, res) => {

    const {
        chat_id,
        mensagem,
        tipo,
        remetente_tipo
    } = req.body;

    const remetente_id = req.user.id;

    const sql = `
        INSERT INTO mensagens
        (chat_id, remetente_id, remetente_tipo, tipo, mensagem)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        chat_id,
        remetente_id,
        remetente_tipo,
        tipo,
        mensagem
    ], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        // 🔥 SOCKET (TEMPO REAL)
        const io = getIo();

        const novaMensagem = {
            id: result.insertId,
            chat_id,
            remetente_id,
            remetente_tipo,
            tipo,
            mensagem
        };

        io.to(`chat_${chat_id}`).emit("nova_mensagem", novaMensagem);

        return res.json(novaMensagem);
    });

});

router.get("/loja/:lojaId", authMiddleware, (req, res) => {

    const { lojaId } = req.params;

    const sql = `
        SELECT c.id, c.pedido_id, c.cliente_id,
        (
            SELECT mensagem
            FROM mensagens m
            WHERE m.chat_id = c.id
            ORDER BY m.id DESC
            LIMIT 1
        ) as ultima_mensagem
        FROM chats c
        WHERE c.loja_id = ?
    `;

    db.query(sql, [lojaId], (err, result) => {

        if (err) return res.status(500).json(err);

        res.json(result);
    });

});

module.exports = router;