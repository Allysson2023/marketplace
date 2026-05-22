const express = require('express');
const router = express.Router();

const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadLojas');

// ===============================
// ATUALIZAR IMAGEM DA LOJA
// ===============================
router.put(
  '/stores/imagem',
  authMiddleware,
  upload.single('imagem'),
  (req, res) => {

    const userId = req.user.id;
    const imagem = req.file ? req.file.filename : null;

    if (!imagem) {
      return res.status(400).json({
        message: 'Nenhuma imagem enviada'
      });
    }

    const sql = `
      UPDATE stores
      SET imagem = ?
      WHERE user_id = ?
    `;

    db.query(sql, [imagem, userId], (err, result) => {

      if (err) {
        console.log(err);

        return res.status(500).json({
          message: 'Erro ao atualizar imagem'
        });
      }

      res.json({
        message: 'Imagem atualizada com sucesso'
      });

    });

  }
);

// ===============================
// CRIAR LOJA
// ===============================
router.post(
  '/stores',
  authMiddleware,
  upload.single('imagem'),
  (req, res) => {

    const { nome, categoria } = req.body;

    const imagem = req.file ? req.file.filename : null;

    if (!nome || !categoria) {
      return res.status(400).json({
        message: 'Nome e categoria são obrigatórios'
      });
    }

    const sql = `
      INSERT INTO stores (
        nome,
        categoria,
        imagem,
        user_id
      )
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      sql,
      [nome, categoria, imagem, req.user.id],
      (err, result) => {

        if (err) {
          console.log(err);

          return res.status(500).json({
            message: 'Erro ao criar loja'
          });
        }

        res.json({
          message: 'Loja criada com sucesso',
          storeId: result.insertId
        });

      }
    );

  }
);

// ===============================
// VERIFICAR SE USUÁRIO TEM LOJA
// ===============================
router.get('/minha-loja', authMiddleware, (req, res) => {

  const userId = req.user.id;

  const sql = `
    SELECT * FROM stores
    WHERE user_id = ?
  `;

  db.query(sql, [userId], (err, result) => {

    if (err) {
      console.log(err);

      return res.status(500).json({
        message: 'Erro no servidor'
      });
    }

    if (result.length > 0) {

      return res.json({
        existe: true,
        loja: result[0]
      });

    }

    res.json({
      existe: false
    });

  });

});

// ===============================
// LISTAR LOJAS
// ===============================
router.get('/stores', (req, res) => {

  const { busca } = req.query;

  let sql = `
    SELECT *
    FROM stores
  `;

  let values = [];

  if (busca) {

    sql += `
      WHERE nome LIKE ?
    `;

    values.push(`%${busca}%`);

  }

  sql += `
    ORDER BY id DESC
  `;

  db.query(sql, values, (err, result) => {

    if (err) {
      console.log(err);

      return res.status(500).json({
        message: 'Erro ao buscar lojas'
      });
    }

    res.json(result);

  });

});

// ===============================
// BUSCAR LOJA POR ID
// ===============================
router.get('/stores/:id', (req, res) => {

  const storeId = req.params.id;

  const sql = `
    SELECT *
    FROM stores
    WHERE id = ?
  `;

  db.query(sql, [storeId], (err, result) => {

    if (err) {
      console.log(err);

      return res.status(500).json({
        message: 'Erro ao buscar loja'
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: 'Loja não encontrada'
      });
    }

    res.json(result[0]);

  });

});

// ===============================
// ATUALIZAR DADOS DA LOJA
// ===============================
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

      if (err) {
        console.log(err);

        return res.status(500).json({
          message: 'Erro ao atualizar loja'
        });
      }

      res.json({
        message: 'Loja atualizada com sucesso'
      });

    }
  );

});

// ===============================
// DASHBOARD DA LOJA
// ===============================
router.get('/stores/:id/dashboard', (req, res) => {

  const storeId = req.params.id;

  console.log('ENTROU NO DASHBOARD:', storeId);

  // FATURAMENTO ÚLTIMOS 7 DIAS
  const sqlUltimosDias = `
    SELECT
      DATE(created_at) AS data,
      COALESCE(SUM(total), 0) AS total
    FROM pedidos
    WHERE loja_id = ?
    AND status = 'finalizado'
    AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    GROUP BY DATE(created_at)
    ORDER BY data ASC
  `;

  // PEDIDOS POR DIA
  const sqlPedidosPorDia = `
    SELECT
      DATE(created_at) AS data,
      COUNT(*) AS total
    FROM pedidos
    WHERE loja_id = ?
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

  // FATURAMENTO MÊS
  const sqlMes = `
    SELECT COALESCE(SUM(total), 0) AS total
    FROM pedidos
    WHERE loja_id = ?
    AND status = 'finalizado'
    AND MONTH(created_at) = MONTH(CURDATE())
    AND YEAR(created_at) = YEAR(CURDATE())
  `;

  // FATURAMENTO ANO
  const sqlAno = `
    SELECT COALESCE(SUM(total), 0) AS total
    FROM pedidos
    WHERE loja_id = ?
    AND status = 'finalizado'
    AND YEAR(created_at) = YEAR(CURDATE())
  `;

  // PRODUTOS MAIS VENDIDOS
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

  // ESTOQUE BAIXO
  const sqlEstoque = `
    SELECT
      id,
      nome,
      estoque
    FROM products
    WHERE store_id = ?
    AND estoque <= 5
  `;

  // TOTAL DE PRODUTOS
  const sqlTotalProdutos = `
    SELECT COUNT(*) AS total
    FROM products
    WHERE store_id = ?
  `;

  // TOTAL DE PEDIDOS
  const sqlTotalPedidos = `
    SELECT COUNT(*) AS total
    FROM pedidos
    WHERE loja_id = ?
  `;

  // ÚLTIMO PEDIDO
const sqlUltimoPedido = `
  SELECT *
  FROM pedidos
  WHERE loja_id = ?
  ORDER BY id DESC
  LIMIT 1
`;

  // EXECUTANDO CONSULTAS
  db.query(sqlPedidosPorDia, [storeId], (err, pedidosPorDia) => {

    if (err) {
      console.log(err);

      return res.status(500).json(err);
    }

    db.query(sqlUltimosDias, [storeId], (err, vendasPorDia) => {

      if (err) {
        console.log(err);

        return res.status(500).json(err);
      }

      db.query(sqlHoje, [storeId], (err, hojeResult) => {

        if (err) {
          console.log(err);

          return res.status(500).json(err);
        }

        db.query(sqlMes, [storeId], (err, mesResult) => {

          if (err) {
            console.log(err);

            return res.status(500).json(err);
          }

          db.query(sqlAno, [storeId], (err, anoResult) => {

            if (err) {
              console.log(err);

              return res.status(500).json(err);
            }

            db.query(sqlTopProdutos, [storeId], (err, topProdutos) => {

              if (err) {
                console.log(err);

                return res.status(500).json(err);
              }

              db.query(sqlEstoque, [storeId], (err, estoqueBaixo) => {

                if (err) {
                  console.log(err);

                  return res.status(500).json(err);
                }

                db.query(sqlTotalProdutos, [storeId], (err, totalProdutosResult) => {

                  if (err) {
                    console.log(err);

                    return res.status(500).json(err);
                  }

                  db.query(sqlTotalPedidos, [storeId], (err, totalPedidosResult) => {

  if (err) {
    console.log(err);

    return res.status(500).json(err);
  }

  // ÚLTIMO PEDIDO
  db.query(sqlUltimoPedido, [storeId], (err, ultimoPedidoResult) => {

    if (err) {
      console.log(err);

      return res.status(500).json(err);
    }

    res.json({

      faturamentoHoje: hojeResult[0].total,
      faturamentoMes: mesResult[0].total,
      faturamentoAno: anoResult[0].total,

      totalProdutos: totalProdutosResult[0].total,
      totalPedidos: totalPedidosResult[0].total,

      topProdutos,
      estoqueBaixo,
      vendasPorDia,
      pedidosPorDia,

      ultimoPedido: ultimoPedidoResult[0] || null

    });

  });

});

                });

              });

            });

          });

        });

      });

    });

  });

});

module.exports = router;