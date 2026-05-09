import { v4 as uuidv4 } from 'uuid';
import type { RowDataPacket } from 'mysql2';
import { pool } from '../../config/db';
import { hashPassword } from '../../utils/password';
import type { RegisterInput } from './auth.schema';

interface UserRow extends RowDataPacket {
  user_id: string;
}

export async function registerUser(input: RegisterInput) {
  const { first_name, last_name, email, phone, password } = input;

  const [rows] = await pool.execute<UserRow[]>(
    'SELECT user_id FROM user WHERE email = ?',
    [email],
  );

  if (rows.length > 0) {
    throw Object.assign(new Error('Email is already in use'), { status: 409 });
  }

  const userId = uuidv4();
  const passwordHash = await hashPassword(password);

  await pool.execute(
    `INSERT INTO user (user_id, first_name, last_name, email, phone, password_hash)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, first_name, last_name, email, phone, passwordHash],
  );

  return { userId, email, first_name, last_name };
}
