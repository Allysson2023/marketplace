const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadProdutos');

router.post(
    '/products',
    authMiddleware,
    upload.fields([
        { name: "imagem", maxCount: 1 },
        { name: "imagem2", maxCount: 1 },
        { name: "imagem3", maxCount: 1 }
    ]),
    (req, res) => {

        const userId = req.user.id;

        const {
            nome,
            descricao,
            preco,
            preco_antigo,
            estoque,
            categoria
        } = req.body;

        const imagem = req.files?.imagem
            ? req.files.imagem[0].filename
            : null;

        const imagem2 = req.files?.imagem2
            ? req.files.imagem2[0].filename
            : null;

        const imagem3 = req.files?.imagem3
            ? req.files.imagem3[0].filename
            : null;

        const sqlStore = `
            SELECT id FROM stores
            WHERE user_id = ?
        `;

        db.query(sqlStore, [userId], (err, storeResult) => {

            if(err){
                return res.status(500).json(err);
            }

            if(storeResult.length === 0){
                return res.status(404).json({
                    error: "Loja não encontrada"
                });
            }

            const store_id = storeResult[0].id;

            const sql = `
                INSERT INTO products
                (
                    nome,
                    descricao,
                    preco,
                    preco_antigo,
                    estoque,
                    imagem,
                    imagem2,
                    imagem3,
                    categoria,
                    store_id
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(
                sql,
                [
                    nome,
                    descricao,
                    preco,
                    preco_antigo,
                    estoque,
                    imagem,
                    imagem2,
                    imagem3,
                    categoria,
                    store_id
                ],
                (err, result) => {

                    if(err){
                        return res.status(500).json(err);
                    }

                    res.json({
                        message: "Produto cadastrado!"
                    });

                }
            );

        });

    }
);

router.get('/products', (req, res) => {

    const { categoria, busca } = req.query;

    let sql = `
        SELECT
            products.*,
            stores.nome AS nomeLoja
        FROM products
        JOIN stores
        ON products.store_id = stores.id
        WHERE 1=1
    `;

    let values = [];

    if(categoria){

        sql += " AND products.categoria = ?";

        values.push(categoria);

    }

    if(busca){

        sql += `
            AND (
                products.nome LIKE ?
                OR products.categoria LIKE ?
                OR stores.nome LIKE ?
            )
        `;

        values.push(`%${busca}%`);
        values.push(`%${busca}%`);
        values.push(`%${busca}%`);

    }

    const pagina = parseInt(req.query.pagina) || 1;

    const limite = 30;

    const offset = (pagina - 1) * limite;

    sql += " ORDER BY products.id DESC LIMIT ? OFFSET ?";

    values.push(limite, offset);

    db.query(sql, values, (err, result) => {

        if(err){
            return res.status(500).json(err);
        }

        res.json(result);

    });

});

router.get('/products/:id', (req, res) => {

    const productId = req.params.id;

    const sql = `
        SELECT
            products.*,
            stores.nome AS nomeLoja
        FROM products
        JOIN stores
        ON products.store_id = stores.id
        WHERE products.id = ?
    `;

    db.query(sql, [productId], (err, result) => {

        if(err){
            return res.status(500).json(err);
        }

        if(result.length === 0){
            return res.status(404).json({
                error: "Produto não encontrado"
            });
        }

        res.json(result[0]);

    });

});

router.get('/stores/:id/products', (req, res) => {

    const storeId = req.params.id;

    const pagina = parseInt(req.query.pagina) || 1;

    const limite = 20;

    const offset = (pagina - 1) * limite;

    const sql = `
        SELECT * FROM products
        WHERE store_id = ?
        ORDER BY id DESC
        LIMIT ? OFFSET ?
    `;

    db.query(
        sql,
        [storeId, limite, offset],
        (err, result) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(result);

        }
    );

});

router.put(
  '/products/:id',
  authMiddleware,
  upload.fields([
    { name: "imagem", maxCount: 1 },
    { name: "imagem2", maxCount: 1 },
    { name: "imagem3", maxCount: 1 }
  ]),
  (req, res) => {

    const productId = req.params.id;

    const {
      nome,
      descricao,
      preco,
      preco_antigo,
      estoque,
      categoria
    } = req.body;

    // 🔥 pegando imagens novas (se vierem)
    const imagem = req.files?.imagem
      ? req.files.imagem[0].filename
      : null;

    const imagem2 = req.files?.imagem2
      ? req.files.imagem2[0].filename
      : null;

    const imagem3 = req.files?.imagem3
      ? req.files.imagem3[0].filename
      : null;

    const sql = `
      UPDATE products
      SET
        nome = ?,
        descricao = ?,
        preco = ?,
        preco_antigo = ?,
        estoque = ?,
        categoria = ?,
        imagem = COALESCE(?, imagem),
        imagem2 = COALESCE(?, imagem2),
        imagem3 = COALESCE(?, imagem3)
      WHERE id = ?
    `;

    db.query(
      sql,
      [
        nome,
        descricao,
        preco,
        preco_antigo,
        estoque,
        categoria,
        imagem,
        imagem2,
        imagem3,
        productId
      ],
      (err, result) => {

        if (err) {
          return res.status(500).json(err);
        }

        return res.json({
          message: "Produto atualizado com sucesso!"
        });

      }
    );
  }
);


module.exports = router;