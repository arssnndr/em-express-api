-- Create the 'groups' table
CREATE TABLE groups (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL UNIQUE
);

-- Create the 'employees' table
CREATE TABLE employees (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    username TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    birth_date DATE NOT NULL,
    basic_salary NUMERIC(15, 2) NOT NULL,
    status TEXT NOT NULL,
    group_name TEXT REFERENCES groups(name),
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the 'users' table for authentication
CREATE TABLE users (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
);

-- Insert dummy data for groups
INSERT INTO groups (name) VALUES
('IT Development'),
('Human Resources'),
('Finance & Accounting'),
('Marketing & Sales'),
('Operations'),
('Customer Service'),
('Quality Assurance'),
('Research & Development'),
('Business Analytics'),
('Project Management');

-- Insert a dummy user for login
-- Note: In a real application, you would hash the password.
-- For this demo, we are storing it as plain text for simplicity.
-- The password 'P@ssw0rd' is stored directly.
-- INSERT INTO users (username, password_hash) VALUES
-- ('admin1', 'P@ssw0rd');

-- Optional: Insert some dummy employee data to get started
-- INSERT INTO employees (username, first_name, last_name, email, birth_date, basic_salary, status, group_name, description)
-- VALUES
-- ('budisantoso', 'Budi', 'Santoso', 'budi.santoso@example.com', '1990-05-15', 10000000, 'Active', 'IT Development', 'Senior Frontend Developer with 5 years of experience.'),
-- ('sitiaminah', 'Siti', 'Aminah', 'siti.aminah@example.com', '1992-08-22', 8500000, 'Active', 'Human Resources', 'HR Generalist responsible for recruitment and employee relations.'),
-- ('dewilestari', 'Dewi', 'Lestari', 'dewi.lestari@example.com', '1988-11-30', 12000000, 'On Leave', 'Finance & Accounting', 'Lead accountant managing financial reports.');

-- Generate 125 dummy employees
WITH
  fnames AS (
    SELECT ARRAY[
      'Ahmad','Siti','Budi','Andi','Dewi','Rizki','Lina','Joko','Maya','Rudi',
      'Indira','Fajar','Ratna','Dian','Eko','Wulan','Agus','Putri','Hendra','Sari'
    ] AS arr
  ),
  lnames AS (
    SELECT ARRAY[
      'Pratama','Sari','Wijaya','Kusuma','Lestari','Santoso','Anggraini','Hidayat','Permata','Setiawan',
      'Maharani','Nugroho','Indah','Gunawan','Safitri','Wahyudi','Rahayu','Putra','Handayani','Wibowo'
    ] AS arr
  ),
  domains AS (
    SELECT ARRAY['gmail.com','yahoo.com','company.com','outlook.com'] AS arr
  ),
  statuses AS (
    SELECT ARRAY['Active','Inactive','On Leave','Probation'] AS arr
  ),
  groups_agg AS (
    SELECT COALESCE(array_agg(name), ARRAY['Default Group']::text[]) AS arr FROM groups
  ),
  name_pairs AS (
    SELECT fn, ln
    FROM unnest((SELECT arr FROM fnames)) AS fn(fn)
    CROSS JOIN unnest((SELECT arr FROM lnames)) AS ln(ln)
    ORDER BY random()
    LIMIT 125
  ),
  paired AS (
    SELECT row_number() OVER () AS rn, fn, ln
    FROM name_pairs
  ),
  status_pool AS (
    -- Ulangi array status secukupnya untuk mencapai >=125 baris, lalu jadikan satu kolom
    SELECT s
    FROM generate_series(
           1,
           CEIL(125.0 / GREATEST(1, array_length((SELECT arr FROM statuses),1)))::int
         ) rep
    CROSS JOIN LATERAL (
      SELECT (SELECT arr FROM statuses)[i] AS s
      FROM generate_subscripts((SELECT arr FROM statuses),1) AS i
    ) x
  ),
  status_seq AS (
    SELECT row_number() OVER (ORDER BY random()) AS rn, s AS status
    FROM status_pool
    LIMIT 125
  ),
  group_pool AS (
    -- Ulangi array group secukupnya untuk mencapai >=125 baris, lalu jadikan satu kolom
    SELECT g
    FROM generate_series(
           1,
           CEIL(125.0 / GREATEST(1, array_length((SELECT arr FROM groups_agg),1)))::int
         ) rep
    CROSS JOIN LATERAL (
      SELECT (SELECT arr FROM groups_agg)[i] AS g
      FROM generate_subscripts((SELECT arr FROM groups_agg),1) AS i
    ) x
  ),
  group_seq AS (
    SELECT row_number() OVER (ORDER BY random()) AS rn, g AS group_name
    FROM group_pool
    LIMIT 125
  )
INSERT INTO employees (
  username, first_name, last_name, email, birth_date, basic_salary, status, group_name, description
)
SELECT
  -- username & email dibuat unik dengan suffix nomor gs
  lower(p.fn) || lower(p.ln) || p.rn AS username,
  p.fn AS first_name,
  p.ln AS last_name,
  lower(p.fn) || '.' || lower(p.ln) || p.rn || '@' || pick.domain AS email,
  -- tanggal lahir: usia 20-59 tahun (acak) + offset hari acak
  (
    current_date
    - ((20 + floor(random()*40))::int * interval '1 year')
    - (floor(random()*365)::int * interval '1 day')
  )::date AS birth_date,
  -- gaji dasar: 5.000.000 - 20.000.000 (acak), dua desimal
  round((5000000 + random()*15000000)::numeric, 2) AS basic_salary,
  status_seq.status AS status,
  group_seq.group_name AS group_name,
  format(
    'Employee %s %s working in %s department with %s status.',
    p.fn, p.ln, group_seq.group_name, status_seq.status
  ) AS description
FROM paired p
JOIN status_seq USING (rn)
JOIN group_seq USING (rn)
CROSS JOIN domains
CROSS JOIN LATERAL (
  SELECT
    domains.arr[1 + floor(random()*array_length(domains.arr,1))::int]     AS domain
) AS pick;
