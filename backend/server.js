require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// LA CLAVE: Aquí es donde montamos las rutas con el prefijo /api
app.use('/api', authRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log('Servidor corriendo en http://localhost:' + PORT);
});
