const express = require("express");
const router = express.Router();

const db = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware");
const { getIo } = require("../utils/socket");


// ==========================================
// LISTAR CHATS DA LOJA (INBOX)
// ==========================================
router.get("/loja/:lojaId", authMiddleware, (req, res) => {

    const { lojaId } = req.params;

    const sql = `
        SELECT
            c.id,
            c.pedido_id,
            c.cliente_id,
            c.loja_id,
            c.criado_em,
            c.atualizado_em,
            c.tem_nova_msg,

            (
                SELECT mensagem
                FROM mensagens m
                WHERE m.chat_id = c.id
                ORDER BY m.id DESC
                LIMIT 1
            ) as ultima_mensagem

        FROM chats c

        WHERE c.loja_id = ?

        ORDER BY c.atualizado_em DESC
    `;

    db.query(sql, [lojaId], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.json(result);

    });

});


// ==========================================
// LISTAR MENSAGENS DO CHAT
// ==========================================
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


// ==========================================
// ENVIAR MENSAGEM
// ==========================================
router.post("/mensagem", authMiddleware, (req, res) => {

    const {
        chat_id,
        mensagem,
        tipo,
        remetente_tipo
    } = req.body;

    const remetente_id = req.user.id;

    // ==========================================
    // VERIFICAR CHAT
    // ==========================================
    const verificarChat = `
        SELECT *
        FROM chats
        WHERE id = ?
    `;

    db.query(verificarChat, [chat_id], (err, chatResult) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        // ==========================================
        // CHAT NÃO EXISTE
        // ==========================================
        if (chatResult.length === 0) {

            const buscarPedido = `
                SELECT loja_id
                FROM pedidos
                WHERE id = ?
            `;

            db.query(
                buscarPedido,
                [chat_id],
                (err2, pedidoResult) => {

                    if (err2) {
                        console.log(err2);
                        return res.status(500).json(err2);
                    }

                    const lojaId = pedidoResult[0]?.loja_id;

                    const criarChat = `
                        INSERT INTO chats
                        (
                            id,
                            pedido_id,
                            cliente_id,
                            loja_id,
                            atualizado_em,
                            tem_nova_msg
                        )
                        VALUES (?, ?, ?, ?, NOW(), TRUE)
                    `;

                    db.query(
                        criarChat,
                        [
                            chat_id,
                            chat_id,
                            remetente_tipo === "cliente"
                                ? remetente_id
                                : null,
                            lojaId
                        ],
                        (err3) => {

                            if (err3) {
                                console.log(err3);
                                return res.status(500).json(err3);
                            }

                            salvarMensagem(lojaId);
                        }
                    );

                }
            );

        } else {

            const lojaId = chatResult[0].loja_id;

            salvarMensagem(lojaId);
        }

    });


    // ==========================================
    // SALVAR MENSAGEM
    // ==========================================
    function salvarMensagem(lojaId) {

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

                // ==========================================
                // ATUALIZA CHAT
                // ==========================================
                const atualizarChat = `
                    UPDATE chats
                    SET
                        atualizado_em = NOW(),
                        tem_nova_msg = TRUE
                    WHERE id = ?
                `;

                db.query(atualizarChat, [chat_id]);

                // ==========================================
                // BUSCAR MENSAGEM COMPLETA
                // ==========================================
                const buscarMensagem = `
                    SELECT *
                    FROM mensagens
                    WHERE id = ?
                `;

                db.query(
                    buscarMensagem,
                    [result.insertId],
                    (err2, mensagemResult) => {

                        if (err2) {
                            console.log(err2);
                            return res.status(500).json(err2);
                        }

                        const novaMensagem = mensagemResult[0];

                        const io = getIo();

                        // ==========================================
                        // CHAT TEMPO REAL
                        // ==========================================
                        io.to(`chat_${chat_id}`).emit(
                            "nova_mensagem",
                            novaMensagem
                        );

                        // ==========================================
                        // NOTIFICAÇÃO LOJA
                        // ==========================================
                        if (lojaId) {

                            io.to(`loja_${lojaId}`).emit(
                                "nova_mensagem_loja",
                                {
                                    ...novaMensagem,
                                    pedido_id: chat_id
                                }
                            );
                        }

                        return res.json(novaMensagem);

                    }
                );

            }
        );
    }

});


// ==========================================
// MARCAR CHAT COMO VISUALIZADO
// ==========================================
router.put("/visualizar/:chatId", authMiddleware, (req, res) => {

    const { chatId } = req.params;

    const sql = `
        UPDATE chats
        SET tem_nova_msg = FALSE
        WHERE id = ?
    `;

    db.query(sql, [chatId], (err) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.json({
            message: "Chat visualizado"
        });

    });

});


router.get("/cliente", authMiddleware, (req, res) => {

    const clienteId = req.user.id;

    const sql = `
        SELECT 
            c.id AS chatId,
            c.loja_id,
            c.atualizado_em,

            (
                SELECT mensagem
                FROM mensagens m
                WHERE m.chat_id = c.id
                ORDER BY m.id DESC
                LIMIT 1
            ) AS ultimaMensagem,

            l.nome AS nomeLoja

        FROM chats c

        INNER JOIN lojas l ON l.id = c.loja_id

        WHERE c.cliente_id = ?

        ORDER BY c.atualizado_em DESC
    `;

    db.query(sql, [clienteId], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.json(result);

    });

});


module.exports = router;