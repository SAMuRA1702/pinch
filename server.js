import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

app.use(cors());
app.use(express.json());

// Получение всех собранных данных (аналог старого db.json)
app.get('/api/data', async (req, res) => {
    try {
        const settingsRes = await pool.query('SELECT * FROM site_settings LIMIT 1');
        const categoriesRes = await pool.query('SELECT * FROM categories ORDER BY display_order');
        const itemsRes = await pool.query('SELECT * FROM items ORDER BY display_order');

        const settings = settingsRes.rows[0];

        // Формируем структуру как на фронтенде
        const categories = categoriesRes.rows.map(cat => ({
            ...cat,
            items: itemsRes.rows.filter(item => item.category_id === cat.id)
        }));

        res.json({
            header: {
                brand: settings.brand,
                slogan: settings.slogan
            },
            contacts: {
                phone: settings.phone,
                email: settings.email
            },
            categories: categories,
            requests: [] // Для безопасности не отдаем все заявки в общий доступ
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера при чтении БД' });
    }
});

// Сохранение изменений контента (Админка)
app.post('/api/data', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { header, contacts, categories } = req.body;

        // Обновляем настройки
        await client.query(
            'UPDATE site_settings SET brand = $1, slogan = $2, phone = $3, email = $4 WHERE id = 1',
            [header.brand, header.slogan, contacts.phone, contacts.email]
        );

        // Логика обновления категорий и товаров (полная замена для простоты прототипа)
        // В реальном проекте лучше делать выборочное обновление
        await client.query('DELETE FROM items');
        await client.query('DELETE FROM categories');

        for (const [catIdx, cat] of categories.entries()) {
            await client.query(
                'INSERT INTO categories (id, title, meta, description, display_order) VALUES ($1, $2, $3, $4, $5)',
                [cat.id, cat.title, cat.meta, cat.description, catIdx]
            );

            for (const [itemIdx, item] of cat.items.entries()) {
                await client.query(
                    'INSERT INTO items (category_id, name, code, price, image, display_order) VALUES ($1, $2, $3, $4, $5, $6)',
                    [cat.id, item.name, item.code, item.price, item.image, itemIdx]
                );
            }
        }

        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'ошибка сохранения в PostgreSQL' });
    } finally {
        client.release();
    }
});

app.listen(PORT, () => {
    console.log(`📡 Сервер на PostgreSQL запущен: http://localhost:${PORT}`);
});
