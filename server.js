require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const { auth } = require('./lib/auth'); // Importaremos tu configuración de Better-Auth aquí

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://davidauthn.online"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://davidauthn.online"],
            imgSrc: ["'self'", "data:", "https://davidauthn.online"],
            connectSrc: ["'self'", "https://davidauthn.online", "capacitor://localhost", "http://localhost"],
        },
    },
}));

app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://davidauthn.online', 'capacitor://localhost', 'http://localhost']
    : ['https://davidauthn.online', 'http://localhost:5173', 'http://10.0.2.2:5173', 'http://localhost', 'http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Bloqueado por políticas de CORS de BUNKERCORE'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { status: 'error', message: "Demasiadas peticiones desde esta IP, reintente en 15 minutos." },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api', apiLimiter);

// --- TODO EL CONTROL DE AUTENTICACIÓN PASA A BETTER-AUTH ---
app.all('/api/auth/*', (req, res) => {
    // Better-Auth procesa Google Login, Passkeys y Sesiones de forma nativa
    return auth.handler(req, res);
});

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    app.use((req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
    });
}

app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`);
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message;
    res.status(statusCode).json({ status: 'error', message: message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BUNKERCORE-V2] Unificado con Better-Auth en puerto: ${PORT}`);
});
