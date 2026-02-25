CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    brand TEXT,
    slogan TEXT,
    phone TEXT,
    email TEXT
);

CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    title TEXT,
    meta TEXT,
    description TEXT,
    display_order INTEGER
);

CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT,
    code TEXT,
    price TEXT,
    image TEXT,
    display_order INTEGER
);

CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    name TEXT,
    phone TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pinch_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pinch_user;
