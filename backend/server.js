require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet'); // Seguridad: Cabeceras HTTP
const rateLimit = require('express-rate-limit'); // Seguridad: Rate Limiting
const compression = require('compression'); // Optimización: Compresión Gzip
const morgan = require('morgan'); // Logging: Acceso HTTP
const authRoutes = require('./routes/authRoutes');

const app = express();

// --- Configuración de Seguridad y Optimización ---
app.set('trust proxy', 1);

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://davidauthn.online"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://davidauthn.online"],
            imgSrc: ["'self'", "data:", "https://davidauthn.online"],
            connectSrc: ["'self'", "https://davidauthn.online"],
        },
    },
}));

app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://davidauthn.online']
    : ['https://davidauthn.online', 'http://localhost:5173', 'http://10.0.2.2:5173', 'http://localhost', 'http://localhost:3000'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Demasiadas peticiones desde esta IP, por favor intenta de nuevo después de 15 minutos.",
    standardHeaders: true,
    legacyHeaders: false,
});

// --- Rutas de la API ---
app.use('/api', apiLimiter);
app.use('/api', authRoutes);

// --- Servir frontend en producción ---
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    // FIX: Se usa app.use sin ruta string para evitar el fallo de path-to-regexp en Express 5
    app.use((req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
    });
}

// --- Manejo de Errores Centralizado ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message;
    res.status(statusCode).json({
        status: 'error',
        message: message
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log();
});
