const express = require('express');

const app = express();

require('./config/db');

app.use(express.json());

const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);

const storeRoutes = require('./routes/storeRoutes');
app.use('/api', storeRoutes);

const productRoutes = require('./routes/productRoutes');
app.use('/api', productRoutes);

app.get('/', (req, res) => {
    res.send("Servidor funcionando!");
});

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
    
})