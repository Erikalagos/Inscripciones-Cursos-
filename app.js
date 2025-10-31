import express from 'express';
import cors from 'cors';

import inscripcionesRoutes from './src/routes/inscripciones.route.js';
import cursoRoutes        from './src/routes/curso.route.js'; // 👈 EXACTO: singular y "route"

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/inscripciones', inscripcionesRoutes);
app.use('/api/cursos', cursoRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

export default app;
