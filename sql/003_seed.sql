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
  ('d5a5764a-7381-4d62-bf20-64e401d85d80', DATE_ADD(CURDATE(), INTERVAL 1 DAY),  '08:00', '09:30', 20, 'open', 'a1b2c3d4-0000-0000-0000-000000000001'),
  ('2dcd18a1-6d97-4ba0-b544-f61465305168', DATE_ADD(CURDATE(), INTERVAL 1 DAY),  '10:00', '11:30', 15, 'open', 'a1b2c3d4-0000-0000-0000-000000000001'),
  ('0a8377c3-f173-4448-9d4f-664ce80c5abb', DATE_ADD(CURDATE(), INTERVAL 2 DAY),  '08:00', '09:30', 20, 'open', 'a1b2c3d4-0000-0000-0000-000000000001'),
  ('f7c82c3d-0820-4fb4-8066-392dfdd18b0e', DATE_ADD(CURDATE(), INTERVAL 3 DAY),  '17:00', '18:30', 10, 'open', 'a1b2c3d4-0000-0000-0000-000000000001'),
  ('40046061-3101-4d6e-875f-800eeba4f6b0', DATE_ADD(CURDATE(), INTERVAL 5 DAY),  '09:00', '10:30', 25, 'open', 'a1b2c3d4-0000-0000-0000-000000000001');
