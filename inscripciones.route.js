
import { Router } from 'express';
import {
  getInscripciones,
  getInscripcionById,
  insertInscripcion,
  deleteInscripcion
} from '../controllers/inscripciones.js';

const router = Router();
router.get('/', getInscripciones);
router.get('/:id', getInscripcionById);
router.post('/', insertInscripcion);
router.delete('/:id', deleteInscripcion);

export default router;
