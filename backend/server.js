const express = require('express');

const app = express();

require('./config/db');

const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);

const storeRoutes = require('./routes/storeRoutes');
app.use('/api', storeRoutes);

const productRoutes = require('./routes/productRoutes');
app.use('/api', productRoutes);

const cartRoutes = require('./routes/cartRoutes');
app.use('/api', cartRoutes);

const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api', categoryRoutes);

const pedidoRoutes = require("./routes/pedidoRoutes");
app.use("/api", pedidoRoutes);

const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api", notificationRoutes);

app.get('/', (req, res) => {
    res.send("Servidor funcionando!");
});

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
    
})