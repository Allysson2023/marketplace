const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware");

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

module.exports = router;