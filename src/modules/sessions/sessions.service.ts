import { v4 as uuidv4 } from 'uuid';
import type { RowDataPacket } from 'mysql2';
import { pool } from '../../config/db';
import type { CreateSessionInput, UpdateSessionInput } from './sessions.schema';

export interface PoolSession {
  session_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  status: 'open' | 'cancelled';
  created_by: string;
  created_at: string;
  reserved_count: number;
  free_spots: number;
}

export interface SessionReservation {
  reservation_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  reserved_at: string;
  cancelled_at: string | null;
}

interface SessionRow extends RowDataPacket {
  session_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  status: 'open' | 'cancelled';
  created_by: string;
  created_at: string;
  reserved_count: number;
}

interface ReservationRow extends RowDataPacket {
  reservation_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  reserved_at: string;
  cancelled_at: string | null;
}

function toSession(row: SessionRow): PoolSession {
  return {
    ...row,
    free_spots: row.capacity - (row.reserved_count ?? 0),
  };
}

export async function createSession(
  input: CreateSessionInput,
  adminId: string,
): Promise<PoolSession> {
  if (input.end_time <= input.start_time) {
    throw Object.assign(new Error('end_time must be after start_time'), { status: 400 });
  }

  const sessionId = uuidv4();
  await pool.execute(
    `INSERT INTO pool_session (session_id, session_date, start_time, end_time, capacity, status, created_by)
     VALUES (?, ?, ?, ?, ?, 'open', ?)`,
    [sessionId, input.session_date, input.start_time, input.end_time, input.capacity, adminId],
  );
  return getSessionById(sessionId);
}

export async function listOpenSessions(): Promise<PoolSession[]> {
  const [rows] = await pool.execute<SessionRow[]>(
    `SELECT ps.*,
            COUNT(CASE WHEN r.status = 'active' THEN 1 END) AS reserved_count
     FROM pool_session ps
     LEFT JOIN reservation r ON r.session_id = ps.session_id
     WHERE ps.status = 'open'
       AND TIMESTAMP(ps.session_date, ps.start_time) > NOW()
     GROUP BY ps.session_id
     HAVING reserved_count < ps.capacity
     ORDER BY ps.session_date ASC, ps.start_time ASC`,
  );
  return rows.map(toSession);
}

export async function getSessionById(sessionId: string): Promise<PoolSession> {
  const [rows] = await pool.execute<SessionRow[]>(
    `SELECT ps.*,
            COUNT(CASE WHEN r.status = 'active' THEN 1 END) AS reserved_count
     FROM pool_session ps
     LEFT JOIN reservation r ON r.session_id = ps.session_id
     WHERE ps.session_id = ?
     GROUP BY ps.session_id`,
    [sessionId],
  );
  if (rows.length === 0) {
    throw Object.assign(new Error('Session not found'), { status: 404 });
  }
  return toSession(rows[0]);
}

export async function updateSession(
  sessionId: string,
  input: UpdateSessionInput,
): Promise<PoolSession> {
  const session = await getSessionById(sessionId);
  if (session.status === 'cancelled') {
    throw Object.assign(new Error('Cannot update a cancelled session'), { status: 400 });
  }

  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (input.session_date !== undefined) {
    fields.push('session_date = ?');
    values.push(input.session_date);
  }
  if (input.start_time !== undefined) {
    fields.push('start_time = ?');
    values.push(input.start_time);
  }
  if (input.end_time !== undefined) {
    fields.push('end_time = ?');
    values.push(input.end_time);
  }
  if (input.capacity !== undefined) {
    fields.push('capacity = ?');
    values.push(input.capacity);
  }

  const resolvedStart = input.start_time ?? session.start_time;
  const resolvedEnd = input.end_time ?? session.end_time;
  if (resolvedEnd <= resolvedStart) {
    throw Object.assign(new Error('end_time must be after start_time'), { status: 400 });
  }

  values.push(sessionId);
  await pool.execute(`UPDATE pool_session SET ${fields.join(', ')} WHERE session_id = ?`, values);
  return getSessionById(sessionId);
}

export async function deleteSession(sessionId: string): Promise<void> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt FROM reservation WHERE session_id = ? AND status = 'active'`,
    [sessionId],
  );
  if ((rows[0].cnt as number) > 0) {
    throw Object.assign(
      new Error('Cannot delete session with active reservations'),
      { status: 409 },
    );
  }
  // FK constraint (ON DELETE RESTRICT) blokira brisanje ako postoje i otkazane rezervacije
  await pool.execute('DELETE FROM reservation WHERE session_id = ?', [sessionId]);
  const [result] = await pool.execute<RowDataPacket[]>(
    'DELETE FROM pool_session WHERE session_id = ?',
    [sessionId],
  );
  const affectedRows = (result as unknown as { affectedRows: number }).affectedRows;
  if (affectedRows === 0) {
    throw Object.assign(new Error('Session not found'), { status: 404 });
  }
}

export async function cancelSession(sessionId: string, adminId: string): Promise<PoolSession> {
  const session = await getSessionById(sessionId);
  if (session.status === 'cancelled') {
    throw Object.assign(new Error('Session is already cancelled'), { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      `UPDATE reservation
       SET status = 'cancelled_by_admin', cancelled_at = NOW(), cancelled_by = ?
       WHERE session_id = ? AND status = 'active'`,
      [adminId, sessionId],
    );
    await conn.execute(
      `UPDATE pool_session SET status = 'cancelled' WHERE session_id = ?`,
      [sessionId],
    );
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  return getSessionById(sessionId);
}

export async function getSessionReservations(sessionId: string): Promise<SessionReservation[]> {
  await getSessionById(sessionId);
  const [rows] = await pool.execute<ReservationRow[]>(
    `SELECT r.reservation_id, r.user_id, u.first_name, u.last_name, u.email,
            r.status, r.reserved_at, r.cancelled_at
     FROM reservation r
     JOIN user u ON u.user_id = r.user_id
     WHERE r.session_id = ?
     ORDER BY r.reserved_at ASC`,
    [sessionId],
  );
  return rows;
}

export async function adminListAllSessions(): Promise<PoolSession[]> {
  const [rows] = await pool.execute<SessionRow[]>(
    `SELECT ps.*,
            COUNT(CASE WHEN r.status = 'active' THEN 1 END) AS reserved_count
     FROM pool_session ps
     LEFT JOIN reservation r ON r.session_id = ps.session_id
     GROUP BY ps.session_id
     ORDER BY ps.session_date DESC, ps.start_time DESC`,
  );
  return rows.map(toSession);
}
