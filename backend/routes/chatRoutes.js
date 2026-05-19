const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware");
const { getIo } = require("../utils/socket");



// ===============================
// LISTAR MENSAGENS DO CHAT
// ===============================
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



// ===============================
// ENVIAR MENSAGEM
// ===============================
router.post("/mensagem", authMiddleware, (req, res) => {

    const {
        chat_id,
        mensagem,
        tipo,
        remetente_tipo,
        loja_id
    } = req.body;

    const remetente_id = req.user.id;



    // ===============================
    // VERIFICA SE CHAT EXISTE
    // ===============================
    const verificarChat = `
        SELECT *
        FROM chats
        WHERE id = ?
    `;

    db.query(verificarChat, [chat_id], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }



        // ===============================
        // CHAT NÃO EXISTE -> CRIA
        // ===============================
        if (result.length === 0) {

            const criarChat = `
                INSERT INTO chats
                (id, pedido_id, cliente_id, loja_id)
                VALUES (?, ?, ?, ?)
            `;

            db.query(
                criarChat,
                [
                    chat_id,
                    chat_id,
                    remetente_tipo === "cliente"
                        ? remetente_id
                        : null,
                    loja_id || null
                ],
                (err2) => {

                    if (err2) {
                        console.log(err2);
                        return res.status(500).json(err2);
                    }

                    salvarMensagem();

                }
            );

        } else {

            salvarMensagem();

        }

    });



    // ===============================
    // SALVAR MENSAGEM
    // ===============================
    function salvarMensagem() {

        const sql = `
            INSERT INTO mensagens
            (
                chat_id,
                remetente_id,
                remetente_tipo,
                tipo,
                mensagem
            )
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                chat_id,
                remetente_id,
                remetente_tipo,
                tipo,
                mensagem
            ],
            (err, result) => {

                if (err) {
                    console.log(err);
                    return res.status(500).json(err);
                }



                // ===============================
                // SOCKET TEMPO REAL
                // ===============================
                const io = getIo();

                const novaMensagem = {
                    id: result.insertId,
                    chat_id,
                    remetente_id,
                    remetente_tipo,
                    tipo,
                    mensagem
                };

                io.to(`chat_${chat_id}`).emit(
                    "nova_mensagem",
                    novaMensagem
                );

                return res.json(novaMensagem);

            }
        );

    }

});



// ===============================
// LISTAR CHATS DA LOJA
// ===============================
router.get("/loja/:lojaId", authMiddleware, (req, res) => {

    const { lojaId } = req.params;

    const sql = `
        SELECT
            c.id,
            c.pedido_id,
            c.cliente_id,
            c.loja_id,
            c.criado_em,

            (
                SELECT mensagem
                FROM mensagens m
                WHERE m.chat_id = c.id
                ORDER BY m.id DESC
                LIMIT 1
            ) as ultima_mensagem

        FROM chats c
        WHERE c.loja_id = ?
        ORDER BY c.id DESC
    `;

    db.query(sql, [lojaId], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.json(result);

    });

});



module.exports = router;