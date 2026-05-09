USE bazeni;

-- Admin nalog
-- Email:    admin@bazeni.rs
-- Lozinka:  Admin1234!
INSERT INTO user (user_id, first_name, last_name, email, phone, password_hash, role)
VALUES (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Admin',
  'Bazeni',
  'admin@bazeni.rs',
  '+381601234567',
  '$2b$10$i6kz/vyrjZc7/uJr18cXrOuCIbJ1gjuWjNMqWjz5ngCE9X2oyO2Fy',
  'admin'
);

-- Probni korisnik
-- Email:    korisnik@bazeni.rs
-- Lozinka:  User1234!
INSERT INTO user (user_id, first_name, last_name, email, phone, password_hash, role)
VALUES (
  'a1b2c3d4-0000-0000-0000-000000000002',
  'Marko',
  'Petrovic',
  'korisnik@bazeni.rs',
  '+381641234567',
  '$2b$10$cUCAh4bA2WmBF2qL8E5a0OWpX7HjnF1TmFnk9OarGZHIb7gBrpqcW',
  'user'
);

-- Probni termini (od danas unapred)
INSERT INTO pool_session (session_id, session_date, start_time, end_time, capacity, status, created_by)
VALUES
  ('s0000001-0000-0000-0000-000000000001', DATE_ADD(CURDATE(), INTERVAL 1 DAY),  '08:00', '09:30', 20, 'open', 'a1b2c3d4-0000-0000-0000-000000000001'),
  ('s0000001-0000-0000-0000-000000000002', DATE_ADD(CURDATE(), INTERVAL 1 DAY),  '10:00', '11:30', 15, 'open', 'a1b2c3d4-0000-0000-0000-000000000001'),
  ('s0000001-0000-0000-0000-000000000003', DATE_ADD(CURDATE(), INTERVAL 2 DAY),  '08:00', '09:30', 20, 'open', 'a1b2c3d4-0000-0000-0000-000000000001'),
  ('s0000001-0000-0000-0000-000000000004', DATE_ADD(CURDATE(), INTERVAL 3 DAY),  '17:00', '18:30', 10, 'open', 'a1b2c3d4-0000-0000-0000-000000000001'),
  ('s0000001-0000-0000-0000-000000000005', DATE_ADD(CURDATE(), INTERVAL 5 DAY),  '09:00', '10:30', 25, 'open', 'a1b2c3d4-0000-0000-0000-000000000001');
