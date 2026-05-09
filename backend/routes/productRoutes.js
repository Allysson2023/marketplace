const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadProdutos');
const { route } = require('./userRoutes');

router.post('/products', authMiddleware, upload.single('imagem'),
    (req, res) => {

    const userId = req.user.id;
    const {nome, descricao, preco, preco_antigo, estoque, categoria
    } = req.body;
    const imagem = req.file ? req.file.filename : null;

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
                nome, descricao, preco, preco_antigo, estoque,
                imagem, categoria, store_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(
            sql,
            [nome, descricao, preco, preco_antigo, estoque,
             imagem, categoria, store_id
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
});

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

router.get('/stores/:id/products', (req, res) => {

    const storeId = req.params.id;

    const sql = `
        SELECT * FROM products
        WHERE store_id = ?
    `;

    db.query(sql, [storeId], (err, result) => {

        if(err){
            return res.status(500).json(err);
        }

        res.json(result);

    });

});

module.exports = router;