
  import sql from 'mssql';

  const dbSettings = {
    user: 'sa',
    password: 'admin1234',
    server: 'DESKTOP-ELAGOS',
    database: 'SistemaEducativo',
    options: {
      encrypt: false,
      trustServerCertificate: true,
      port: 1433,
    },
  };

  let pool = null;


  export async function getConnection() {
    if (pool) return pool;
    try {
      pool = await sql.connect(dbSettings);
      console.log(' Conexión a SQL Server OK');
      return pool;
    } catch (err) {
      console.error(' Error al conectar a SQL Server:', err);
      pool = null;
      throw err;
    }
  }


  export { sql };
