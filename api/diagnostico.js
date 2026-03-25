/**
 * NEXUS TECH — Diagnóstico de conexión
 * Endpoint temporal: /api/diagnostico
 * ELIMINAR después de confirmar que funciona
 */

const { Pool } = require('pg');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // 1. Verificar variables de entorno
  const envCheck = {
    PGHOST:     process.env.PGHOST     ? '✅ ' + process.env.PGHOST : '❌ NO DEFINIDA',
    PGPORT:     process.env.PGPORT     ? '✅ ' + process.env.PGPORT : '❌ NO DEFINIDA',
    PGUSER:     process.env.PGUSER     ? '✅ definida (oculta)'     : '❌ NO DEFINIDA',
    PGPASSWORD: process.env.PGPASSWORD ? '✅ definida (oculta)'     : '❌ NO DEFINIDA',
    PGDATABASE: process.env.PGDATABASE ? '✅ ' + process.env.PGDATABASE : '❌ NO DEFINIDA',
    DB_NAME:    process.env.DB_NAME    ? '✅ ' + process.env.DB_NAME    : '❌ NO DEFINIDA',
    DATABASE_URL: process.env.DATABASE_URL ? '✅ definida (oculta)' : '❌ NO DEFINIDA',
  };

  // Base de datos que se usará
  const dbName = process.env.DB_NAME || process.env.PGDATABASE || 'NO DEFINIDA';
  envCheck['→ DB que se usará'] = dbName;

  // 2. Intentar conexión
  let connectionTest = '⏳ No intentada';
  let tableTest      = '⏳ No intentada';
  let errorDetail    = null;

  try {
    const pool = new Pool({
      host:     process.env.PGHOST,
      port:     parseInt(process.env.PGPORT || '5432'),
      database: dbName,
      user:     process.env.PGUSER,
      password: process.env.PGPASSWORD,
      ssl:      { rejectUnauthorized: false },
      connectionTimeoutMillis: 8000,
    });

    const client = await pool.connect();
    connectionTest = '✅ Conexión exitosa';

    // 3. Verificar que la tabla existe
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'Clientes_web'
      ) AS exists
    `);
    const exists = result.rows[0]?.exists;
    tableTest = exists ? '✅ Tabla "Clientes_web" existe' : '❌ Tabla "Clientes_web" NO existe — debes crearla';

    // 4. Contar registros
    if (exists) {
      const count = await client.query('SELECT COUNT(*) FROM "Clientes_web"');
      tableTest += ` (${count.rows[0].count} registros)`;
    }

    client.release();
    await pool.end();

  } catch (err) {
    connectionTest = '❌ Error de conexión';
    errorDetail    = {
      message: err.message,
      code:    err.code,
      hint:    err.hint || null,
    };
  }

  return res.status(200).json({
    status:     'diagnóstico completado',
    variables:  envCheck,
    conexion:   connectionTest,
    tabla:      tableTest,
    error:      errorDetail,
    timestamp:  new Date().toISOString(),
  });
};
