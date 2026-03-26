/**
 * NEXUS TECH — API Route Vercel (Node.js)
 * Endpoint: /api/form
 * BD: maindb_web en Neon PostgreSQL
 * Tabla: Clientes_web
 *
 * Instalar dependencia:  npm install pg
 * (agregar package.json en la raíz del proyecto)
 */

const { Pool } = require('pg');

// Pool de conexión reutilizable entre invocaciones (Vercel lo cachea)
const pool = new Pool({
  host:     process.env.maindb_web_PGHOST || process.env.PGHOST,
  port:     parseInt(process.env.maindb_web_PGPORT || process.env.PGPORT || '5432'),
  database: process.env.DB_NAME || process.env.maindb_web_PGDATABASE || process.env.PGDATABASE,
  user:     process.env.maindb_web_PGUSER || process.env.PGUSER,
  password: process.env.maindb_web_PGPASSWORD || process.env.PGPASSWORD,
  ssl:      { rejectUnauthorized: false }, // requerido por Neon
  max:      1,                             // serverless: 1 conexión por función
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});

// ——— Helper: respuesta JSON ———
function json(res, status, data) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(status).json(data);
}

// ——— Handler principal ———
module.exports = async function handler(req, res) {

  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return json(res, 200, { ok: true });
  }

  // Solo POST
  if (req.method !== 'POST') {
    return json(res, 405, { success: false, message: 'Método no permitido.' });
  }

  // ——— Leer body (Vercel parsea JSON automáticamente) ———
  const body = req.body || {};

  const nombres   = (body.nombres   || '').toString().trim().toUpperCase();
  const apellidos = (body.apellidos || '').toString().trim().toUpperCase();
  const correo    = (body.correo    || '').toString().trim().toLowerCase();
  const telefono  = (body.telefono  || '').toString().trim().replace(/\D/g, '');

  // ——— Validaciones ———
  if (!nombres || !apellidos || !correo || !telefono) {
    return json(res, 400, { success: false, message: 'Todos los campos son obligatorios.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    return json(res, 400, { success: false, message: 'El correo no es válido.' });
  }

  if (telefono.length < 7 || telefono.length > 15) {
    return json(res, 400, { success: false, message: 'El teléfono debe tener entre 7 y 15 dígitos.' });
  }

  // ——— Consulta a BD ———
  let client;
  try {
    client = await pool.connect();

    // Verificar duplicado por teléfono (llave única)
    const check = await client.query(
      'SELECT id FROM clientes_web WHERE telefono = $1 LIMIT 1',
      [telefono]
    );
    if (check.rowCount > 0) {
      return json(res, 409, { success: false, message: 'Este número de teléfono ya está registrado.' });
    }

    // Insertar
    await client.query(
      `INSERT INTO clientes_web (nombres, apellidos, correo, telefono)
       VALUES ($1, $2, $3, $4)`,
      [nombres, apellidos, correo, telefono]
    );

    return json(res, 200, { success: true, message: 'Registro exitoso.' });

  } catch (err) {
    console.error('DB error:', err.message);
    // Unique constraint violation de PostgreSQL
    if (err.code === '23505') {
      return json(res, 409, { success: false, message: 'Este teléfono ya está registrado.' });
    }
    return json(res, 500, { success: false, message: 'Error al guardar el registro.', detail: err.message, code: err.code });
  } finally {
    if (client) client.release();
  }
};
