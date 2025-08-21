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
-- The password 'password123' is stored directly.
INSERT INTO users (username, password_hash) VALUES
('admin', 'password123');

-- Optional: Insert some dummy employee data to get started
INSERT INTO employees (username, first_name, last_name, email, birth_date, basic_salary, status, group_name, description)
VALUES
('budisantoso', 'Budi', 'Santoso', 'budi.santoso@example.com', '1990-05-15', 10000000, 'Active', 'IT Development', 'Senior Frontend Developer with 5 years of experience.'),
('sitiaminah', 'Siti', 'Aminah', 'siti.aminah@example.com', '1992-08-22', 8500000, 'Active', 'Human Resources', 'HR Generalist responsible for recruitment and employee relations.'),
('dewilestari', 'Dewi', 'Lestari', 'dewi.lestari@example.com', '1988-11-30', 12000000, 'On Leave', 'Finance & Accounting', 'Lead accountant managing financial reports.');

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
    SELECT array_agg(name) AS arr FROM groups
  )
INSERT INTO employees (
  username, first_name, last_name, email, birth_date, basic_salary, status, group_name, description
)
SELECT
  -- username & email dibuat unik dengan suffix nomor gs
  lower(pick.fn) || lower(pick.ln) || gs AS username,
  pick.fn AS first_name,
  pick.ln AS last_name,
  lower(pick.fn) || '.' || lower(pick.ln) || gs || '@' || pick.domain AS email,
  -- tanggal lahir: usia 20-59 tahun (acak) + offset hari acak
  (
    current_date
    - ((20 + floor(random()*40))::int * interval '1 year')
    - (floor(random()*365)::int * interval '1 day')
  )::date AS birth_date,
  -- gaji dasar: 5.000.000 - 20.000.000 (acak), dua desimal
  round((5000000 + random()*15000000)::numeric, 2) AS basic_salary,
  pick.status AS status,
  pick.group_name AS group_name,
  format(
    'Employee %s %s working in %s department with %s status.',
    pick.fn, pick.ln, pick.group_name, pick.status
  ) AS description
FROM generate_series(1,125) AS gs
CROSS JOIN fnames
CROSS JOIN lnames
CROSS JOIN domains
CROSS JOIN statuses
CROSS JOIN groups_agg
CROSS JOIN LATERAL (
  SELECT
    fnames.arr[1 + (random()*(array_length(fnames.arr,1)-1))::int]   AS fn,
    lnames.arr[1 + (random()*(array_length(lnames.arr,1)-1))::int]   AS ln,
    statuses.arr[1 + (random()*(array_length(statuses.arr,1)-1))::int] AS status,
    groups_agg.arr[1 + (random()*(array_length(groups_agg.arr,1)-1))::int] AS group_name,
    domains.arr[1 + (random()*(array_length(domains.arr,1)-1))::int] AS domain
) AS pick;
