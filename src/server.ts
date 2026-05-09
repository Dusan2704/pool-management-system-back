import { app } from './app';
import { env } from './config/env';
import { pool } from './config/db';

async function start(): Promise<void> {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log('Database connected');

    app.listen(env.PORT, () => {
      console.log(`Server running on http://localhost:${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
