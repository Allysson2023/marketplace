const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware");
const { getIo } = require("../utils/socket");


router.post("/pedidos", authMiddleware, (req, res) => {

    const usuario_id = req.user.id;

    const {
        loja_id,
        total,
        produtos,
        tipoPedido,
        dadosEntrega
    } = req.body;

    const status = "AGUARDANDO_CONFIRMACAO";

    let dados = dadosEntrega;

if (typeof dados === "string") {
    dados = JSON.parse(dados);
}

dados = dados || {};

    const sqlPedido = `
        INSERT INTO pedidos
        (usuario_id, loja_id, total, status,
         tipo_pedido, nome_cliente, endereco, numero, bairro, pagamento, cpf)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sqlPedido,
        [
            usuario_id,
            loja_id,
            total,
            status,

            tipoPedido,
            dados.nome || null,
            dados.endereco || null,
            dados.numero || null,
            dados.bairro || null,
            dados.pagamento || null,
            dados.cpf || null
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            const pedido_id = result.insertId;

            const itens = produtos.map((produto) => [
                pedido_id,
                produto.produto_id,
                produto.quantidade,
                produto.preco
            ]);

            const sqlItens = `
                INSERT INTO pedido_itens
                (pedido_id, produto_id, quantidade, preco)
                VALUES ?
            `;

            db.query(sqlItens, [itens], (err2) => {

                if (err2) {
                    return res.status(500).json(err2);
                }

                res.json({
                    message: "Pedido criado com sucesso",
                    pedidoId: pedido_id
                });
                const io = getIo();

io.to(`loja_${loja_id}`).emit("novo_pedido", {
    pedido_id,
    usuario_id,
    total,
    status: "AGUARDANDO_CONFIRMACAO"
});

            });

        }
    );

});


router.get("/pedidos/:id", authMiddleware, (req, res) => {

    const { id } = req.params;

    const sqlPedido = `
    SELECT * FROM pedidos 
    WHERE id = ? AND usuario_id = ?
`;

    const sqlItens = `
        SELECT 
            pedido_itens.*,
            products.nome,
            products.imagem
        FROM pedido_itens
        JOIN products ON products.id = pedido_itens.produto_id
        WHERE pedido_itens.pedido_id = ?
    `;

    db.query(sqlPedido, [id, req.user.id], (err, pedidoResult) => {

        if (err) return res.status(500).json(err);

        db.query(sqlItens, [id], (err2, itensResult) => {

            if (err2) return res.status(500).json(err2);

            if (!pedidoResult.length) {
    return res.status(404).json({ message: "Pedido não encontrado" });
}

const p = pedidoResult[0];

            const pedidoFormatado = {
                ...p,
                dadosEntrega: {
                    nome: p.nome_cliente,
                    endereco: p.endereco,
                    numero: p.numero,
                    bairro: p.bairro,
                    pagamento: p.pagamento,
                    cpf: p.cpf
                }
            };

            res.json({
                pedido: pedidoFormatado,
                itens: itensResult
            });

        });

    });

});
router.get("/meus-pedidos", authMiddleware, (req, res) => {

    const usuario_id = req.user.id;

    const sql = `
        SELECT * FROM pedidos
        WHERE usuario_id = ?
        ORDER BY id DESC
    `;

    db.query(sql, [usuario_id], (err, result) => {

        if (err) return res.status(500).json(err);

        res.json(result);

    });

});

router.get("/loja/pedidos", authMiddleware, (req, res) => {

    const userId = req.user.id;

    const sql = `
        SELECT 
            pedidos.id,
            pedidos.total,
            pedidos.status,
            pedidos.tipo_pedido,
            pedidos.created_at,
            users.username,
            stores.nome AS loja_nome
        FROM pedidos
        JOIN stores ON stores.id = pedidos.loja_id
        JOIN users ON users.id = pedidos.usuario_id
        WHERE stores.user_id = ?
        ORDER BY pedidos.id DESC
    `;

    db.query(sql, [userId], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);

    });

});

router.get("/loja/:id/pedidos", authMiddleware, (req, res) => {

    const storeId = req.params.id;

    const sql = `
        SELECT 
            pedidos.id,
            pedidos.total,
            pedidos.status,
            pedidos.tipo_pedido,
            users.username
        FROM pedidos
        JOIN users ON users.id = pedidos.usuario_id
        WHERE pedidos.loja_id = ?
        ORDER BY pedidos.id DESC
    `;

    db.query(sql, [storeId], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);

    });

});

router.put("/pedidos/:id/status", authMiddleware, (req, res) => {

    const pedidoId = req.params.id;
    const { status } = req.body;

    const mensagemStatus = {
        aceito: "Seu pedido foi aceito pela loja ✅",
        separacao: "Seu pedido está em separação 📦",
        rota: "Seu pedido saiu para entrega 🛵",
        finalizado: "Pedido finalizado ✔️",
        recusado: "Seu pedido foi recusado ❌"
    };

    const sql = `
        UPDATE pedidos
        SET status = ?
        WHERE id = ?
    `;

    db.query(sql, [status, pedidoId], (err) => {

        if (err) {
            return res.status(500).json(err);
        }

        // 🔥 BUSCAR DONO DO PEDIDO
        const sqlBuscarPedido = `
            SELECT usuario_id
            FROM pedidos
            WHERE id = ?
        `;

        db.query(sqlBuscarPedido, [pedidoId], (err2, result) => {

            if (err2) {
                return res.status(500).json(err2);
            }

            if (result.length === 0) {
                return res.status(404).json({
                    message: "Pedido não encontrado"
                });
            }

            const usuarioId = result[0].usuario_id;

            // 🔥 SALVAR NOTIFICAÇÃO NO BANCO
            const sqlNotificacao = `
                INSERT INTO notifications
                (user_id, pedido_id, titulo, mensagem)
                VALUES (?, ?, ?, ?)
            `;

            db.query(
                sqlNotificacao,
                [
                    usuarioId,
                    pedidoId,
                    "Atualização do Pedido",
                    mensagemStatus[status]
                ],
                (err3) => {

                    if (err3) {
                        return res.status(500).json(err3);
                    }

                    // 🔥 SOCKET (TEMPO REAL AQUI!)
                   const io = getIo();

const mensagem = mensagemStatus[status] || "Atualização do pedido";

io.to(`user_${usuarioId}`).emit("nova_notificacao", {
    pedido_id: pedidoId,
    mensagem: mensagem,
    titulo: "Atualização do Pedido"
});

                    return res.json({
                        message: "Status atualizado e notificação enviada!"
                    });

                }
            );

        });

    });

});

module.exports = router;