import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import type { RowDataPacket } from 'mysql2';
import { pool } from '../../config/db';
import { hashPassword, comparePassword } from '../../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import type { RegisterInput, LoginInput } from './auth.schema';

interface EmailCheckRow extends RowDataPacket {
  user_id: string;
}

interface UserRow extends RowDataPacket {
  user_id: string;
  first_name: string;
  last_name: string;
  password_hash: string;
  role: 'admin' | 'user';
  is_active: number;
}

interface UserInfoRow extends RowDataPacket {
  user_id: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'user';
  is_active: number;
}

interface TokenRow extends RowDataPacket {
  token_id: string;
  revoked_at: string | null;
  expires_at: string;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
  const tokenId = uuidv4();
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pool.execute(
    'INSERT INTO refresh_token (token_id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
    [tokenId, userId, tokenHash, expiresAt],
  );
}

export async function registerUser(input: RegisterInput) {
  const { first_name, last_name, email, phone, password } = input;

  const [rows] = await pool.execute<EmailCheckRow[]>(
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

export async function loginUser(input: LoginInput) {
  const { email, password } = input;

  const [rows] = await pool.execute<UserRow[]>(
    'SELECT user_id, first_name, last_name, password_hash, role, is_active FROM user WHERE email = ?',
    [email],
  );

  if (rows.length === 0) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401 });
  }

  const user = rows[0];

  if (!user.is_active) {
    throw Object.assign(new Error('Account is disabled'), { status: 403 });
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401 });
  }

  const accessToken = signAccessToken({ userId: user.user_id, role: user.role, firstName: user.first_name, lastName: user.last_name });
  const refreshToken = signRefreshToken(user.user_id);
  await storeRefreshToken(user.user_id, refreshToken);

  return { access_token: accessToken, refresh_token: refreshToken };
}

export async function refreshAccessToken(refreshToken: string) {
  let userId: string;
  try {
    ({ userId } = verifyRefreshToken(refreshToken));
  } catch {
    throw Object.assign(new Error('Invalid refresh token'), { status: 401 });
  }

  const tokenHash = hashToken(refreshToken);
  const [tokenRows] = await pool.execute<TokenRow[]>(
    'SELECT token_id, revoked_at, expires_at FROM refresh_token WHERE token_hash = ?',
    [tokenHash],
  );

  if (tokenRows.length === 0 || tokenRows[0].revoked_at !== null) {
    throw Object.assign(new Error('Refresh token is invalid or revoked'), { status: 401 });
  }

  if (new Date() > new Date(tokenRows[0].expires_at)) {
    throw Object.assign(new Error('Refresh token has expired'), { status: 401 });
  }

  const [userRows] = await pool.execute<UserInfoRow[]>(
    'SELECT user_id, first_name, last_name, role, is_active FROM user WHERE user_id = ?',
    [userId],
  );

  if (userRows.length === 0 || !userRows[0].is_active) {
    throw Object.assign(new Error('User not found or disabled'), { status: 401 });
  }

  // Revoke old token (rotation — svaki refresh token se koristi samo jednom)
  await pool.execute(
    'UPDATE refresh_token SET revoked_at = NOW() WHERE token_id = ?',
    [tokenRows[0].token_id],
  );

  const newAccessToken = signAccessToken({ userId: userRows[0].user_id, role: userRows[0].role, firstName: userRows[0].first_name, lastName: userRows[0].last_name });
  const newRefreshToken = signRefreshToken(userRows[0].user_id);
  await storeRefreshToken(userRows[0].user_id, newRefreshToken);

  return { access_token: newAccessToken, refresh_token: newRefreshToken };
}

export async function logoutUser(refreshToken: string) {
  const tokenHash = hashToken(refreshToken);
  await pool.execute(
    'UPDATE refresh_token SET revoked_at = NOW() WHERE token_hash = ? AND revoked_at IS NULL',
    [tokenHash],
  );
}
