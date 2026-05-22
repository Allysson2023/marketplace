const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadLojas');

router.put( '/stores/imagem', authMiddleware, upload.single('imagem'),
  (req, res) => {

    const userId = req.user.id;
    const imagem = req.file ? req.file.filename : null;

    const sql = `
      UPDATE stores SET imagem = ? WHERE user_id = ?
    `;
    db.query(sql,[imagem, userId],(err, result) => {
        if(err){
          return res.status(500).json(err);
        }
        res.json({
          message: "Imagem atualizada com sucesso"
        });
      }
    );
});

router.post('/stores', authMiddleware, upload.single('imagem'),(req, res) => {

    const { nome, categoria } = req.body;
    const imagem = req.file ? req.file.filename : null;
    const sql = `
      INSERT INTO stores (nome, categoria, imagem, user_id)
      VALUES (?, ?, ?, ?)
    `;
    db.query(
      sql,
      [nome, categoria, imagem, req.user.id],
      (err, result) => {
        if(err){
          return res.status(500).json(err);
        }
        res.json({
          message: 'Loja criada com sucesso'
        });
      }
    );
});

router.get('/minha-loja', authMiddleware, (req, res) => {
    const userId = req.user.id;
    const sql = "SELECT * FROM stores WHERE user_id = ?";

    db.query(sql, [userId], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        if(result.length > 0){
            return res.json({
                existe: true
            });
        }
        res.json({
            existe: false
        });
    });
});

router.get('/stores', (req, res) => {
    const { busca } = req.query;
    let sql = "SELECT * FROM stores";
    let values = [];

    if(busca){
        sql += " WHERE nome LIKE ?";
        values.push(`%${busca}%`);
    }
    sql += " ORDER BY id DESC";
    db.query(sql, values, (err, result) => {
        if(err){
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

router.get('/stores/:id', (req, res) => {

    const storeId = req.params.id;

    const sql = `
        SELECT * FROM stores
        WHERE id = ?
    `;

    db.query(sql, [storeId], (err, result) => {

        if(err){
            return res.status(500).json(err);
        }

        res.json(result[0]);

    });

});

router.put('/stores/:id', authMiddleware, (req, res) => {

    const storeId = req.params.id;

    const {
        nome,
        descricao,
        horario_abertura,
        horario_fechamento
    } = req.body;

    const sql = `
        UPDATE stores
        SET
            nome = ?,
            descricao = ?,
            horario_abertura = ?,
            horario_fechamento = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            nome,
            descricao,
            horario_abertura,
            horario_fechamento,
            storeId
        ],
        (err) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                message: "Loja atualizada!"
            });

        }
    );

});

// DASHBOARD DA LOJA
router.get('/stores/:id/dashboard', (req, res) => {

    const storeId = req.params.id;

    console.log("ENTROU NO DASHBOARD:", storeId);

    const sqlUltimosDias = `
    SELECT 
        DATE(created_at) as data,
        SUM(total) as total
    FROM pedidos
    WHERE loja_id = ?
    AND status = 'finalizado'
    AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    GROUP BY DATE(created_at)
    ORDER BY data ASC
`;

    // FATURAMENTO HOJE
    const sqlHoje = `
        SELECT COALESCE(SUM(total), 0) AS total
        FROM pedidos
        WHERE loja_id = ?
        AND status = 'finalizado'
        AND DATE(created_at) = CURDATE()
    `;

    const sqlMes = `
        SELECT COALESCE(SUM(total), 0) AS total
        FROM pedidos
        WHERE loja_id = ?
        AND status = 'finalizado'
        AND MONTH(created_at) = MONTH(CURDATE())
        AND YEAR(created_at) = YEAR(CURDATE())
    `;

    const sqlAno = `
        SELECT COALESCE(SUM(total), 0) AS total
        FROM pedidos
        WHERE loja_id = ?
        AND status = 'finalizado'
        AND YEAR(created_at) = YEAR(CURDATE())
    `;

    db.query(sqlUltimosDias, [storeId], (err, vendasPorDia) => {

    if (err) {
        return res.status(500).json(err);
    }

    db.query(sqlHoje, [storeId], (err, hojeResult) => {

        if(err){
            return res.status(500).json(err);
        }

        db.query(sqlMes, [storeId], (err, mesResult) => {

            if(err){
                return res.status(500).json(err);
            }

            db.query(sqlAno, [storeId], (err, anoResult) => {

                if(err){
                    return res.status(500).json(err);
                }

                const sqlTopProdutos = `
                    SELECT 
                        p.id,
                        p.nome,
                        SUM(pi.quantidade) AS quantidade
                    FROM pedido_itens pi
                    JOIN products p
                        ON p.id = pi.produto_id
                    JOIN pedidos ped
                        ON ped.id = pi.pedido_id
                    WHERE ped.loja_id = ?
                    GROUP BY p.id, p.nome
                    ORDER BY quantidade DESC
                    LIMIT 5
                `;

                db.query(sqlTopProdutos, [storeId], (err, topProdutos) => {

                    if(err){
                        return res.status(500).json(err);
                    }

                    const sqlEstoque = `
                        SELECT id, nome, estoque
                        FROM products
                        WHERE store_id = ?
                        AND estoque <= 5
                    `;

                    db.query(sqlEstoque, [storeId], (err, estoqueBaixo) => {

                        if(err){
                            return res.status(500).json(err);
                        }

                        res.json({
                            faturamentoHoje: hojeResult[0].total,
                            faturamentoMes: mesResult[0].total,
                            faturamentoAno: anoResult[0].total,
                            topProdutos,
                            estoqueBaixo,
                            vendasPorDia

                     });

                    });

                });
                });
            });

        });

    });

});


module.exports = router;