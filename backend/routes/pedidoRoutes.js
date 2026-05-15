const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/pedidos", authMiddleware, (req, res) => {

    const usuario_id = req.user.id;

    const {
        loja_id,
        total,
        produtos
    } = req.body;

    const status = "AGUARDANDO_CONFIRMACAO";

    const sqlPedido = `
        INSERT INTO pedidos
        (usuario_id, loja_id, total, status)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sqlPedido,
        [usuario_id, loja_id, total, status],
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

            });

        }
    );

});

module.exports = router;