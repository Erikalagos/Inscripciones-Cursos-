import { Router } from 'express';
import {
  getCursos,
  getCursoById,
  insertCurso,
  deleteCurso
} from '../controllers/curso.js'; // 👈 coincide con tu archivo controllers/curso.js

const router = Router();

router.get('/', getCursos);
router.get('/:id', getCursoById);
router.post('/', insertCurso);
router.delete('/:id', deleteCurso);

export default router; // 👈 export default obligatorio
