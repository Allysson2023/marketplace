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

module.exports = router;