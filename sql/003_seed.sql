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

-- Probne CMS stranice
INSERT INTO page (page_id, slug, title, content, is_published, sort_order, updated_by)
VALUES
  (
    'e1f2a3b4-c5d6-7890-abcd-ef1234567801',
    'o-nama',
    'O nama',
    '<h2>O bazenu</h2><p>Dobrodošli u PoolBuddy — sistem za rezervaciju termina u gradskom bazenu. Naš bazen nudi modernu infrastrukturu i profesionalne usluge za sve uzraste.</p><p>Radno vreme: ponedeljak–petak 07:00–21:00, vikend 08:00–20:00.</p>',
    1,
    1,
    'a1b2c3d4-0000-0000-0000-000000000001'
  ),
  (
    'e1f2a3b4-c5d6-7890-abcd-ef1234567802',
    'pravila-koriscenja',
    'Pravila korišćenja',
    '<h2>Pravila korišćenja bazena</h2><ul><li>Obavezna je kupaoničarska kapa.</li><li>Pre ulaska u vodu obavezno istuširati se.</li><li>Zabranjeno je skakanje na neoznačenim mestima.</li><li>Deca mlađa od 10 godina moraju biti u pratnji odrasle osobe.</li><li>Zabranjeno je unošenje hrane i pića u bazenski prostor.</li><li>Rezervacija važi isključivo za rezervisani termin.</li></ul>',
    1,
    2,
    'a1b2c3d4-0000-0000-0000-000000000001'
  ),
  (
    'e1f2a3b4-c5d6-7890-abcd-ef1234567803',
    'kontakt',
    'Kontakt',
    '<h2>Kontaktirajte nas</h2><p><strong>Adresa:</strong> Ul. Bazenska 1, Beograd</p><p><strong>Telefon:</strong> +381 11 123 4567</p><p><strong>Email:</strong> info@poolbuddy.rs</p><p><strong>Radno vreme recepcije:</strong> svakim danom 07:00–21:00</p>',
    1,
    3,
    'a1b2c3d4-0000-0000-0000-000000000001'
  ),
  (
    'e1f2a3b4-c5d6-7890-abcd-ef1234567804',
    'cenovnik',
    'Cenovnik',
    '<h2>Cenovnik</h2><table><thead><tr><th>Usluga</th><th>Cena</th></tr></thead><tbody><tr><td>Jednokratna poseta (90 min)</td><td>500 RSD</td></tr><tr><td>Mesečna karta</td><td>3.500 RSD</td></tr><tr><td>Godišnja karta</td><td>30.000 RSD</td></tr><tr><td>Škola plivanja (8 termina)</td><td>6.000 RSD</td></tr></tbody></table>',
    1,
    4,
    'a1b2c3d4-0000-0000-0000-000000000001'
  );
