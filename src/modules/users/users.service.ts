import type { RowDataPacket } from 'mysql2';
import { pool } from '../../config/db';
import { comparePassword, hashPassword } from '../../utils/password';

export interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: 'admin' | 'user';
  is_active: number;
  created_at: string;
}

interface UserRow extends RowDataPacket, UserProfile {}

interface UserListRow extends RowDataPacket {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: 'admin' | 'user';
  is_active: number;
  created_at: string;
}

export async function getProfile(userId: string): Promise<UserProfile> {
  const [rows] = await pool.execute<UserRow[]>(
    'SELECT user_id, first_name, last_name, email, phone, role, is_active, created_at FROM user WHERE user_id = ?',
    [userId],
  );
  if (rows.length === 0) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }
  return rows[0];
}

export async function updateProfile(
  userId: string,
  data: { phone?: string; email?: string },
): Promise<UserProfile> {
  const fields: string[] = [];
  const values: string[] = [];

  if (data.phone !== undefined) {
    fields.push('phone = ?');
    values.push(data.phone);
  }
  if (data.email !== undefined) {
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT user_id FROM user WHERE email = ? AND user_id != ?',
      [data.email, userId],
    );
    if (existing.length > 0) {
      throw Object.assign(new Error('Email is already in use'), { status: 409 });
    }
    fields.push('email = ?');
    values.push(data.email);
  }

  if (fields.length > 0) {
    values.push(userId);
    await pool.execute(`UPDATE user SET ${fields.join(', ')} WHERE user_id = ?`, values);
  }

  return getProfile(userId);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT password_hash FROM user WHERE user_id = ?',
    [userId],
  );
  if (rows.length === 0) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const valid = await comparePassword(currentPassword, rows[0].password_hash as string);
  if (!valid) {
    throw Object.assign(new Error('Current password is incorrect'), { status: 400 });
  }

  const newHash = await hashPassword(newPassword);
  await pool.execute('UPDATE user SET password_hash = ? WHERE user_id = ?', [newHash, userId]);
}

export async function listAllUsers(): Promise<UserListRow[]> {
  const [rows] = await pool.execute<UserListRow[]>(
    'SELECT user_id, first_name, last_name, email, phone, role, is_active, created_at FROM user ORDER BY created_at DESC',
  );
  return rows;
}

export async function toggleUserActive(
  targetUserId: string,
  requestingUserId: string,
): Promise<UserProfile> {
  if (targetUserId === requestingUserId) {
    throw Object.assign(new Error('Cannot change your own active status'), { status: 400 });
  }

  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT is_active FROM user WHERE user_id = ?',
    [targetUserId],
  );
  if (rows.length === 0) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const newStatus = rows[0].is_active ? 0 : 1;
  await pool.execute('UPDATE user SET is_active = ? WHERE user_id = ?', [newStatus, targetUserId]);
  return getProfile(targetUserId);
}
