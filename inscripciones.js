// src/controllers/inscripciones.js
import { getConnection, sql } from '../database/connection.js';

// ✅ Un solo pool para todo el módulo
const poolPromise = getConnection();

// Helpers
const ESTADOS_VALIDOS = new Set(['Activo', 'Completado', 'Cancelado', 'Retirado']);

export const getInscripciones = async (_req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('dbo.GET_Inscripciones');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error en GET_Inscripciones:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getInscripcionById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, Number(id))
      .execute('dbo.GET_InscripcionesID');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Inscripción no encontrada' });
    }
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error en GET_InscripcionesID:', error);
    res.status(500).json({ error: error.message });
  }
};

export const insertInscripcion = async (req, res) => {
  try {
    let { cursoId, estudianteId, estado = 'Activo', calificacion = null } = req.body;

    // Normaliza tipos
    cursoId = Number(cursoId);
    estudianteId = Number(estudianteId);
    if (!cursoId || !estudianteId) {
      return res.status(400).json({ message: 'cursoId y estudianteId son requeridos' });
    }

    if (!ESTADOS_VALIDOS.has(estado)) {
      return res.status(400).json({ message: 'estado inválido' });
    }

    // Calificación: null o número [0..100], con DECIMAL(5,2)
    let calif = null;
    if (calificacion !== null && calificacion !== '') {
      calif = Number(calificacion);
      if (isNaN(calif) || calif < 0 || calif > 100) {
        return res.status(400).json({ message: 'La calificación debe estar entre 0 y 100.' });
      }
    }

    const pool = await poolPromise;
    const reqDb = pool.request()
      .input('cursoId', sql.Int, cursoId)
      .input('estudianteId', sql.Int, estudianteId)
      .input('estado', sql.VarChar(20), estado);

    // 👇 Tipar siempre como DECIMAL(5,2); si es null, pasa null
    reqDb.input('calificacion', sql.Decimal(5, 2), calif);

    // Nota: usa el nombre de tu SP real (mantengo el tuyo)
    const result = await reqDb.execute('dbo.INSERT_Inscripciones');

    const row = result.recordset?.[0];
    if (row?.ErrorNumber) {
      return res.status(400).json({ error: row.ErrorMessage });
    }

    res.status(201).json({
      message: 'Inscripción agregada con éxito',
      id: row?.nuevoId
    });
  } catch (error) {
    // Duplicados (índice único)
    if (error.number === 2627 || error.number === 2601) {
      return res.status(400).json({ error: 'El estudiante ya está inscrito en ese curso.' });
    }
    console.error('Error en INSERT_Inscripciones:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteInscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, Number(id))
      .execute('dbo.DELETE_Inscripciones');

    const filas = result.recordset?.[0]?.filasAfectadas || 0;
    if (filas === 0) {
      return res.status(404).json({ message: 'Inscripción no encontrada' });
    }
    res.json({ message: 'Inscripción eliminada correctamente', filas });
  } catch (error) {
    console.error('Error en DELETE_Inscripciones:', error);
    res.status(500).json({ error: error.message });
  }
};
