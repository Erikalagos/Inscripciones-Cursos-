// src/controllers/curso.js
import { getConnection, sql } from '../database/connection.js';

export const getCursos = async (_req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().execute('dbo.GET_Cursos');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en GET_Cursos:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getCursoById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .execute('dbo.GET_CursosID');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error en GET_CursosID:', err);
    res.status(500).json({ error: err.message });
  }
};

export const insertCurso = async (req, res) => {
  try {
    const {
      nombre,
      descripcion = null,
      profesorId,
      creditos = 3,
      horas_duracion = null,
      activo = 1
    } = req.body;

    if (!nombre || !profesorId) {
      return res.status(400).json({ message: 'nombre y profesorId son requeridos' });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input('nombre', sql.VarChar(100), nombre)
      .input('descripcion', sql.VarChar(200), descripcion)
      .input('profesorId', sql.Int, Number(profesorId))
      .input('creditos', sql.Int, Number(creditos))
      .input('horas_duracion', sql.Int, horas_duracion !== null ? Number(horas_duracion) : null)
      .input('activo', sql.Bit, Boolean(activo))
      .execute('dbo.INSERT_Cursos');

    const row = result.recordset[0];
    if (row?.ErrorNumber) return res.status(400).json({ error: row.ErrorMessage });

    res.status(201).json({ message: 'Curso agregado con éxito', id: row.nuevoId });
  } catch (err) {
    if (err.number === 547) { // FK profesor
      return res.status(400).json({ error: 'profesorId no existe.' });
    }
    console.error('Error en INSERT_Cursos:', err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteCurso = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .execute('dbo.DELETE_Cursos');

    const filas = result.recordset[0]?.filasAfectadas || 0;
    if (filas === 0) return res.status(404).json({ message: 'Curso no encontrado' });

    res.json({ message: 'Curso eliminado correctamente', filas });
  } catch (err) {
    console.error('Error en DELETE_Cursos:', err);
    res.status(500).json({ error: err.message });
  }
};
