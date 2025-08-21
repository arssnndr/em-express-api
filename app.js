import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import indexRouter from './routes/index.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy if deployed behind a reverse proxy (enables secure cookies)
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

app.use(logger('dev'));
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || true,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Avoid 404 for favicon
app.get('/favicon.ico', (_req, res) => res.status(204).end());

// Health check
app.get('/', (_req, res) => {
    res.send('Employee Management API is running!');
});

// Mount routes
app.use('/', indexRouter);
app.use('/api', indexRouter);

// Fallback 404 as JSON
app.use((req, res) => {
    res.status(404).json({ message: 'Not Found', path: req.path });
});

export default app;
