import { v4 as uuidv4 } from 'uuid';
import type { RowDataPacket } from 'mysql2';
import { pool } from '../../config/db';

export interface MyReservation {
  reservation_id: string;
  session_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  session_status: 'open' | 'cancelled';
  status: 'active' | 'cancelled_by_user' | 'cancelled_by_admin';
  reserved_at: string;
  cancelled_at: string | null;
}

interface ReservationRow extends RowDataPacket, MyReservation {}

interface SessionCheckRow extends RowDataPacket {
  status: 'open' | 'cancelled';
  session_date: string;
  reserved_count: number;
  capacity: number;
}

interface ReservationCheckRow extends RowDataPacket {
  reservation_id: string;
  user_id: string;
  status: string;
  session_date: string;
}

export async function createReservation(
  userId: string,
  sessionId: string,
): Promise<{ reservation_id: string }> {
  const [sessionRows] = await pool.execute<SessionCheckRow[]>(
    `SELECT ps.status, ps.session_date, ps.capacity,
            COUNT(CASE WHEN r.status = 'active' THEN 1 END) AS reserved_count
     FROM pool_session ps
     LEFT JOIN reservation r ON r.session_id = ps.session_id
     WHERE ps.session_id = ?
     GROUP BY ps.session_id`,
    [sessionId],
  );

  if (sessionRows.length === 0) {
    throw Object.assign(new Error('Session not found'), { status: 404 });
  }

  const session = sessionRows[0];

  if (session.status !== 'open') {
    throw Object.assign(new Error('Termin je otkazan'), { status: 400 });
  }

  if (new Date(session.session_date) < new Date(new Date().toDateString())) {
    throw Object.assign(new Error('Termin je već prošao'), { status: 400 });
  }

  if (session.reserved_count >= session.capacity) {
    throw Object.assign(new Error('Termin nema slobodnih mesta'), { status: 409 });
  }

  // Check if an existing (possibly cancelled) reservation exists for this user+session
  const [existing] = await pool.execute<RowDataPacket[]>(
    'SELECT reservation_id, status FROM reservation WHERE user_id = ? AND session_id = ?',
    [userId, sessionId],
  );

  if (existing.length > 0) {
    const existingReservation = existing[0];
    if (existingReservation.status === 'active') {
      throw Object.assign(new Error('Već ste rezervisali ovaj termin'), { status: 409 });
    }
    // Reactivate cancelled reservation
    await pool.execute(
      `UPDATE reservation
       SET status = 'active', cancelled_at = NULL, cancelled_by = NULL
       WHERE reservation_id = ?`,
      [existingReservation.reservation_id],
    );
    return { reservation_id: existingReservation.reservation_id as string };
  }

  const reservationId = uuidv4();
  await pool.execute(
    `INSERT INTO reservation (reservation_id, user_id, session_id, status)
     VALUES (?, ?, ?, 'active')`,
    [reservationId, userId, sessionId],
  );

  return { reservation_id: reservationId };
}

export async function listMyReservations(userId: string): Promise<MyReservation[]> {
  const [rows] = await pool.execute<ReservationRow[]>(
    `SELECT r.reservation_id, r.session_id, r.status, r.reserved_at, r.cancelled_at,
            ps.session_date, ps.start_time, ps.end_time, ps.capacity,
            ps.status AS session_status
     FROM reservation r
     JOIN pool_session ps ON ps.session_id = r.session_id
     WHERE r.user_id = ?
     ORDER BY ps.session_date DESC, ps.start_time DESC`,
    [userId],
  );
  return rows;
}

export async function cancelReservation(
  reservationId: string,
  userId: string,
): Promise<void> {
  const [rows] = await pool.execute<ReservationCheckRow[]>(
    `SELECT r.reservation_id, r.user_id, r.status, ps.session_date
     FROM reservation r
     JOIN pool_session ps ON ps.session_id = r.session_id
     WHERE r.reservation_id = ?`,
    [reservationId],
  );

  if (rows.length === 0) {
    throw Object.assign(new Error('Reservation not found'), { status: 404 });
  }

  const reservation = rows[0];

  if (reservation.user_id !== userId) {
    throw Object.assign(new Error('Forbidden'), { status: 403 });
  }

  if (reservation.status !== 'active') {
    throw Object.assign(new Error('Rezervacija je već otkazana'), { status: 400 });
  }

  if (new Date(reservation.session_date) < new Date(new Date().toDateString())) {
    throw Object.assign(new Error('Ne možete otkazati rezervaciju za prošli termin'), {
      status: 400,
    });
  }

  await pool.execute(
    `UPDATE reservation
     SET status = 'cancelled_by_user', cancelled_at = NOW(), cancelled_by = ?
     WHERE reservation_id = ?`,
    [userId, reservationId],
  );
}
