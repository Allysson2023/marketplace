const express = require('express');
const router = express.Router();

const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadLojas');


function checkOwner(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Não autenticado" });
  }

  const storeId = parseInt(req.params.id);

  if (isNaN(storeId)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  const sql = `
    SELECT id
    FROM stores
    WHERE id = ? AND user_id = ?
    LIMIT 1
  `;

  db.query(sql, [storeId, req.user.id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Erro no servidor" });
    }

    if (result.length === 0) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    req.storeId = storeId;
    next();
  });
}

// ===============================
// IMAGEM DA LOJA
// ===============================
router.put(
  '/stores/imagem',
  authMiddleware,
  upload.single('imagem'),
  (req, res) => {

    const userId = req.user.id;
    const imagem = req.file ? req.file.filename : null;

    if (!imagem) {
      return res.status(400).json({ message: 'Nenhuma imagem enviada' });
    }

    const sql = `
      UPDATE stores
      SET imagem = ?
      WHERE user_id = ?
    `;

    db.query(sql, [imagem, userId], (err) => {
      if (err) {
        return res.status(500).json({ message: 'Erro ao atualizar imagem' });
      }

      res.json({ message: 'Imagem atualizada com sucesso' });
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

    const {
      nome,
      categoria,
      whatsapp,
      username,
      password
    } = req.body;

    const imagem = req.file ? req.file.filename : null;
    const funcionario_id = req.user.id;

    if (
      !nome ||
      !categoria ||
      !whatsapp ||
      !username ||
      !password
    ) {
      return res.status(400).json({
        message: 'Preencha todos os campos'
      });
    }

    // verifica se já existe usuário
    const sqlVerifica = `
      SELECT id
      FROM users
      WHERE username = ?
      LIMIT 1
    `;

    db.query(sqlVerifica, [username], (err, usuarioExiste) => {

      if (err) {
        return res.status(500).json({
          message: 'Erro ao verificar usuário'
        });
      }

      if (usuarioExiste.length > 0) {
        return res.status(400).json({
          message: 'Usuário já existe'
        });
      }

      // cria o lojista
      const sqlUser = `
        INSERT INTO users (
          username,
          password,
          tipo
        )
        VALUES (?, ?, 'lojista')
      `;

      db.query(
        sqlUser,
        [username, password],
        (err, userResult) => {

          if (err) {
            console.log(err);

            return res.status(500).json({
              message: 'Erro ao criar usuário'
            });
          }

          const lojistaId = userResult.insertId;

          // cria a loja vinculada ao lojista
          const sqlStore = `
            INSERT INTO stores (
              nome,
              categoria,
              imagem,
              whatsapp,
              funcionario_id,
              user_id
            )
            VALUES (?, ?, ?, ?, ?, ?)
          `;

          db.query(
            sqlStore,
            [
              nome,
              categoria,
              imagem,
              whatsapp,
              funcionario_id,
              lojistaId
            ],
            (err, storeResult) => {

              if (err) {
                console.log(err);

                return res.status(500).json({
                  message: 'Erro ao criar loja'
                });
              }

              res.json({
                message: 'Loja criada com sucesso',
                storeId: storeResult.insertId,
                lojistaId
              });

            }
          );

        }
      );

    });

  }
);

// ===============================
// MINHA LOJA
// ===============================
router.get('/minha-loja', authMiddleware, (req, res) => {

  const sql = `
    SELECT * FROM stores
    WHERE user_id = ?
  `;

  db.query(sql, [req.user.id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Erro no servidor' });
    }

    if (result.length > 0) {
      return res.json({ existe: true, loja: result[0] });
    }

    res.json({ existe: false });
  });
});



// ===============================
// LISTAR LOJAS (PÚBLICO)
// ===============================
router.get('/stores', (req, res) => {

  const { busca } = req.query;

  let sql = `SELECT * FROM stores`;
  let values = [];

  if (busca) {
    sql += ` WHERE nome LIKE ?`;
    values.push(`%${busca}%`);
  }

  sql += ` ORDER BY id DESC`;

  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar lojas' });
    }

    res.json(result);
  });
});





// ===============================
// LOJA PÚBLICA (CLIENTE)
// ===============================
router.get('/stores/:id/public', (req, res) => {

  const sql = `
    SELECT 
      id,
      nome,
      descricao,
      imagem,
      categoria,
      whatsapp,
      facebook,
      instagram,
      horario_abertura,
      horario_fechamento
    FROM stores
    WHERE id = ?
  `;

  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Erro no servidor" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Loja não encontrada" });
    }

    res.json(result[0]);
  });
});

// ===============================
// BUSCAR LOJA DO DONO
// ===============================
router.get('/stores/:id', authMiddleware, checkOwner, (req, res) => {

  const sql = `
    SELECT *
    FROM stores
    WHERE id = ? AND user_id = ?
    LIMIT 1
  `;

  db.query(sql, [req.storeId, req.user.id], (err, result) => {

    if (err) {
      return res.status(500).json({
        message: 'Erro no servidor'
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
// PRODUTOS PÚBLICOS DA LOJA
// ===============================
router.get('/stores/:id/public/products', (req, res) => {

  const storeId = req.params.id;

  const pagina = parseInt(req.query.pagina) || 1;

  const limite = 20;

  const offset = (pagina - 1) * limite;

  const sql = `
    SELECT
      id,
      nome,
      preco,
      imagem
    FROM products
    WHERE store_id = ?
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `;

  db.query(sql, [storeId, limite, offset], (err, result) => {

    if (err) {
      console.log(err);

      return res.status(500).json({
        message: 'Erro ao buscar produtos'
      });
    }

    res.json(result);

  });

});


// ===============================
// ATUALIZAR LOJA (SEGURA)
// ===============================
router.put('/stores/:id', authMiddleware, checkOwner, (req, res) => {

  const {
    nome,
    descricao,
    horario_abertura,
    horario_fechamento,
    facebook,
    instagram
  } = req.body;

  const sql = `
    UPDATE stores
    SET nome = ?, descricao = ?, horario_abertura = ?, horario_fechamento = ?, facebook = ?, instagram = ?
    WHERE id = ? AND user_id = ?
  `;

  db.query(sql, [
    nome,
    descricao,
    horario_abertura,
    horario_fechamento,
    facebook,
    instagram,
    req.storeId,
    req.user.id
  ], (err) => {

    if (err) {
      return res.status(500).json({ message: 'Erro ao atualizar loja' });
    }

    res.json({ message: 'Loja atualizada com sucesso' });
  });
});

// ===============================
// DASHBOARD DA LOJA
// ===============================
router.get('/stores/:id/dashboard', authMiddleware, checkOwner,(req, res) => {

  const storeId = parseInt(req.params.id);


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


  const sqlMenosVendidos = `
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

  ORDER BY quantidade ASC

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

              db.query(sqlMenosVendidos, [storeId], (err, menosVendidos) => {
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
      menosVendidos,
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

});

router.get('/stores/:id/estoque', authMiddleware, checkOwner, (req, res) => {

  const storeId = req.params.id;

  const sql = `
    SELECT id, nome, estoque
    FROM products
    WHERE store_id = ?
    ORDER BY estoque ASC
  `;

  db.query(sql, [storeId], (err, result) => {

    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);

  });

});

router.get('/stores/:id/mais-vendidos', authMiddleware, checkOwner, (req, res) => {

  const storeId = req.params.id;

  const sql = `
    SELECT 
      p.id,
      p.nome,
      SUM(pi.quantidade) AS total_vendido
    FROM pedido_itens pi
    JOIN products p ON p.id = pi.produto_id
    JOIN pedidos ped ON ped.id = pi.pedido_id
    WHERE ped.loja_id = ?
    GROUP BY p.id, p.nome
    ORDER BY total_vendido DESC
    LIMIT 10
  `;

  db.query(sql, [storeId], (err, result) => {

    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);

  });

});

router.get('/stores/:id/financeiro', authMiddleware, checkOwner, (req, res) => {

  const storeId = req.params.id;

  const sql = `
    SELECT 
      DATE(created_at) as data,
      SUM(total) as total
    FROM pedidos
    WHERE loja_id = ?
    AND status = 'finalizado'
    GROUP BY DATE(created_at)
    ORDER BY data ASC
  `;

  db.query(sql, [storeId], (err, result) => {

    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);

  });

});

router.get('/stores/:id/clientes', authMiddleware, checkOwner, (req, res) => {

  const storeId = req.params.id;

  const sql = `
    SELECT 
      u.id,
      u.nome,
      COUNT(p.id) as total_pedidos
    FROM pedidos p
    JOIN users u ON u.id = p.user_id
    WHERE p.loja_id = ?
    GROUP BY u.id, u.nome
    ORDER BY total_pedidos DESC
  `;

  db.query(sql, [storeId], (err, result) => {

    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);

  });

});


router.get(
  "/funcionario/minhas-lojas",
  authMiddleware,
  (req, res) => {

    const funcionarioId = req.user.id;

    const sql = `
      SELECT
    s.id,
    s.nome,
    s.categoria,
    s.imagem,

    (
        SELECT COUNT(*)
        FROM products p
        WHERE p.store_id = s.id
    ) AS total_produtos,

    (
        SELECT COUNT(*)
        FROM pedidos pe
        WHERE pe.loja_id = s.id
    ) AS total_pedidos,

    COALESCE((
        SELECT SUM(pe.total)
        FROM pedidos pe
        WHERE pe.loja_id = s.id
        AND pe.status = 'finalizado'
        AND DATE(pe.created_at) = CURDATE()
    ), 0) AS faturamento,

    CASE
        WHEN s.horario_abertura IS NULL
          OR s.horario_fechamento IS NULL THEN 0

        WHEN s.horario_abertura < s.horario_fechamento THEN
            CASE
                WHEN CURTIME() BETWEEN s.horario_abertura
                                   AND s.horario_fechamento
                THEN 1
                ELSE 0
            END

        ELSE
            CASE
                WHEN CURTIME() >= s.horario_abertura
                  OR CURTIME() < s.horario_fechamento
                THEN 1
                ELSE 0
            END
    END AS aberta

FROM stores s

WHERE s.funcionario_id = ?

ORDER BY s.id DESC
    `;

    db.query(sql, [funcionarioId], (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    });
});

router.get("/funcionario/loja-dashboard/:id", authMiddleware, (req, res) => {

    const lojaId = req.params.id;

    const sql = `
        SELECT
            s.id,
            s.nome,

            COALESCE((
                SELECT SUM(total)
                FROM pedidos
                WHERE loja_id = s.id
                AND status = 'finalizado'
                AND DATE(created_at) = CURDATE()
            ),0) AS faturamentoHoje,

            COALESCE((
                SELECT SUM(total)
                FROM pedidos
                WHERE loja_id = s.id
                AND status = 'finalizado'
                AND MONTH(created_at) = MONTH(CURDATE())
                AND YEAR(created_at) = YEAR(CURDATE())
            ),0) AS faturamentoMes,

            COALESCE((
                SELECT SUM(total)
                FROM pedidos
                WHERE loja_id = s.id
                AND status = 'finalizado'
                AND YEAR(created_at) = YEAR(CURDATE())
            ),0) AS faturamentoAno,

            COALESCE((
                SELECT COUNT(*)
                FROM products
                WHERE store_id = s.id
            ),0) AS total_produtos,

            COALESCE((
                SELECT COUNT(*)
                FROM pedidos
                WHERE loja_id = s.id
            ),0) AS total_pedidos

        FROM stores s
        WHERE s.id = ?
        LIMIT 1
    `;

    db.query(sql, [lojaId], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.json(result[0]);

    });

});

router.get(
  "/funcionario/top-lojas",
  authMiddleware,
  (req, res) => {

    const sql = `
      SELECT
          s.id,
          s.nome,
          s.categoria,

          COALESCE(
            SUM(
              CASE
                WHEN p.status = 'finalizado'
                AND DATE(p.created_at) = CURDATE()
                THEN p.total
                ELSE 0
              END
            ),0
          ) AS faturamentoHoje,

          COUNT(
            DISTINCT CASE
              WHEN DATE(p.created_at) = CURDATE()
              THEN p.id
            END
          ) AS pedidosHoje

      FROM stores s

      LEFT JOIN pedidos p
        ON p.loja_id = s.id

      GROUP BY s.id

      ORDER BY faturamentoHoje DESC
    `;

    db.query(sql, (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json(result);

    });

});

router.get(
  "/funcionario/resumo",
  authMiddleware,
  (req, res) => {

    const funcionarioId = req.user.id;

    const sql = `
      SELECT

        COUNT(*) AS totalLojas,

        COUNT(*) * 40 AS ganhos,

        (
          SELECT COUNT(*)
          FROM products p
          JOIN stores s ON s.id = p.store_id
          WHERE s.funcionario_id = ?
        ) AS totalProdutos

      FROM stores
      WHERE funcionario_id = ?
    `;

    db.query(
      sql,
      [funcionarioId, funcionarioId],
      (err, result) => {

        if (err) {
          console.log(err);
          return res.status(500).json(err);
        }

        const dados = result[0];

        const meta = 50; // exemplo

        const crescimento = Math.min(
          ((dados.totalLojas / meta) * 100),
          100
        );

        res.json({
          totalLojas: dados.totalLojas,
          ganhos: dados.ganhos,
          totalProdutos: dados.totalProdutos,
          crescimento: crescimento.toFixed(0)
        });

      }
    );

  }
);

module.exports = router;