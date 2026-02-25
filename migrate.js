import fs from 'fs-extra';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://pinch_user:pinch_pass@localhost:5432/pinch_db'
});

async function migrate() {
    try {
        const dbPath = path.join(__dirname, 'db.json');
        if (!await fs.exists(dbPath)) {
            console.log('db.json not found, nothing to migrate.');
            return;
        }

        const data = await fs.readJson(dbPath);
        console.log('Migrating data...');

        // 1. Site Settings
        await pool.query('DELETE FROM site_settings');
        await pool.query(
            'INSERT INTO site_settings (brand, slogan, phone, email) VALUES ($1, $2, $3, $4)',
            [data.header.brand, data.header.slogan, data.contacts.phone, data.contacts.email]
        );

        // 2. Categories and Items
        await pool.query('DELETE FROM items');
        await pool.query('DELETE FROM categories');

        for (const [catIdx, cat] of data.categories.entries()) {
            await pool.query(
                'INSERT INTO categories (id, title, meta, description, display_order) VALUES ($1, $2, $3, $4, $5)',
                [cat.id, cat.title, cat.meta, cat.description, catIdx]
            );

            for (const [itemIdx, item] of cat.items.entries()) {
                await pool.query(
                    'INSERT INTO items (category_id, name, code, price, image, display_order) VALUES ($1, $2, $3, $4, $5, $6)',
                    [cat.id, item.name, item.code, item.price, item.image, itemIdx]
                );
            }
        }

        console.log('✅ Migration successful!');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
