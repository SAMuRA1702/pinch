import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { Instagram, Send, X, Phone, Mail, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- DATA PERSISTENCE ---
const STORAGE_KEY = 'pinch_drop_data';

const initialData = {
  header: {
    brand: 'PINCH & DROP',
    slogan: 'Насыщенные яркие вкусы, тщательно подобранные натуральные ингредиенты и оригинальная рецептура'
  },
  categories: [
    {
      id: 'syrups',
      title: 'Сиропы',
      meta: 'стекло | 1 л | 24 месяца',
      description: 'Pinch&Drop® — это насыщенные яркие вкусы, тщательно подобранные натуральные ингредиенты и оригинальная рецептура сиропов!',
      items: [
        { id: 1, name: 'Amaretto', code: '5034506', price: '750', image: '' },
        { id: 2, name: 'Яблочный пирог', code: '5030911', price: '750', image: '' }
      ]
    },
    {
      id: 'pures',
      title: 'Фруктовое пюре',
      meta: 'пластик | 1 л | 12 месяцев',
      description: 'Содержат около 70 % фруктов и ягод, полностью натуральные.',
      items: [
        { id: 3, name: 'Банан', code: '5045174', price: '1200', image: '' }
      ]
    }
  ],
  contacts: {
    phone: '+7 (495) 431-90-60',
    email: 'export@complexbar.com',
    instagram: 'https://instagram.com/pinch_drop',
    telegram: 'https://t.me/pinch_drop'
  },
  requests: []
};

// --- ANIMATION VARIANTS ---
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// --- COMPONENTS ---

const Landing = ({ data, setData }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [callbackForm, setCallbackForm] = useState({ name: '', phone: '' });
  const [isSent, setIsSent] = useState(false);

  const handleCallback = (e) => {
    e.preventDefault();
    const newRequest = {
      id: Date.now(),
      ...callbackForm,
      date: new Date().toLocaleString()
    };
    setData({
      ...data,
      requests: [newRequest, ...(data.requests || [])]
    });
    setCallbackForm({ name: '', phone: '' });
    setIsSent(true);
    setTimeout(() => setIsSent(false), 3000);
  };

  return (
    <div className="app">
      <header>
        <div className="container">
          <motion.div
            className="logo-section"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h1 className="brand-name">{data.header.brand}</h1>
          </motion.div>
          <motion.div
            className="slogan-box"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <p className="slogan-text">{data.header.slogan}</p>
          </motion.div>
        </div>
      </header>

      <main className="container">
        {data.categories.map((cat) => (
          <section key={cat.id}>
            <div className="category-block">
              <motion.div
                className="category-header"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="category-title">{cat.title}</h2>
                <div className="category-meta">{cat.meta}</div>
              </motion.div>

              <p className="category-description">{cat.description}</p>

              <motion.div
                className="product-grid"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-100px" }}
              >
                {cat.items.length > 0 ? (
                  cat.items.map((item) => (
                    <motion.div
                      key={item.id}
                      className="product-item"
                      variants={fadeInUp}
                      onClick={() => setSelectedProduct({ ...item, categoryMeta: cat.meta })}
                    >
                      <div className="product-placeholder">
                        {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
                      </div>
                      <div className="product-name">{item.name}</div>
                      <div className="product-code">{item.code}</div>
                      {item.price && <div className="product-price">{item.price} SUM</div>}
                    </motion.div>
                  ))
                ) : (
                  <div style={{ opacity: 0.5, gridColumn: '1/-1' }}>Товары в данной категории пока отсутствуют.</div>
                )}
              </motion.div>
            </div>
          </section>
        ))}
      </main>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setSelectedProduct(null)}><X size={32} /></button>

              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                {selectedProduct.image ? (
                  <img src={selectedProduct.image} alt={selectedProduct.name} style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
                ) : (
                  <div style={{ fontSize: '100px', opacity: 0.05 }}>▲</div>
                )}
              </div>

              <div>
                <div style={{ color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px', marginBottom: '16px' }}>{selectedProduct.categoryMeta}</div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '42px', marginBottom: '20px', border: 'none', padding: 0 }}>{selectedProduct.name}</h2>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Артикул: {selectedProduct.code}</div>

                {selectedProduct.price && (
                  <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--accent)', marginBottom: '40px' }}>{selectedProduct.price} SUM</div>
                )}

                {selectedProduct.description && (
                  <div>
                    <h4 style={{ textTransform: 'uppercase', fontSize: '12px', marginBottom: '12px', color: 'var(--text-secondary)' }}>О товаре:</h4>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>{selectedProduct.description}</p>
                  </div>
                )}

                <button
                  className="btn-main"
                  style={{ width: '100%', marginTop: '40px' }}
                  onClick={() => {
                    setSelectedProduct(null);
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  }}
                >
                  Заказать обратный звонок
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-info">
              <h3 style={{ fontSize: '24px', marginBottom: '32px', fontFamily: 'Playfair Display, serif' }}>Связаться с нами</h3>
              <form onSubmit={handleCallback}>
                <input
                  type="text"
                  placeholder="Ваше имя"
                  className="form-input"
                  required
                  value={callbackForm.name}
                  onChange={e => setCallbackForm({ ...callbackForm, name: e.target.value })}
                />
                <input
                  type="tel"
                  placeholder="Номер телефона"
                  className="form-input"
                  required
                  value={callbackForm.phone}
                  onChange={e => setCallbackForm({ ...callbackForm, phone: e.target.value })}
                />
                <button type="submit" className="btn-main">Отправить запрос</button>
                {isSent && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'var(--accent)', marginTop: '15px' }}>Спасибо! Мы скоро свяжемся с вами.</motion.div>}
              </form>
            </div>

            <div className="footer-contacts">
              <h3 style={{ fontSize: '24px', marginBottom: '32px', fontFamily: 'Playfair Display, serif' }}>Контакты</h3>
              <div className="contact-links">
                <a href={`tel:${data.contacts.phone}`} style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Phone size={20} color="var(--accent)" /> {data.contacts.phone}
                </a>
                <a href={`mailto:${data.contacts.email}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                  <Mail size={18} color="var(--accent)" /> {data.contacts.email}
                </a>

                <div className="social-icons-row">
                  {data.contacts.instagram && (
                    <a href={data.contacts.instagram} target="_blank" rel="noreferrer" className="social-icon-link">
                      <Instagram size={20} />
                    </a>
                  )}
                  {data.contacts.telegram && (
                    <a href={data.contacts.telegram} target="_blank" rel="noreferrer" className="social-icon-link">
                      <Send size={20} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid var(--border-color)', opacity: 0.3, fontSize: '12px', textAlign: 'center' }}>
            © {new Date().getFullYear()} PINCH & DROP • ALL RIGHTS RESERVED
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- ADMIN PANEL ---
const Admin = ({ data, setData }) => {
  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div style={{ padding: '0 40px', marginBottom: '40px' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', letterSpacing: '2px' }}>PINCH ADMIN</h1>
        </div>
        <nav>
          <Link to="/admin" className="admin-nav-item">Общие настройки</Link>
          <Link to="/admin/requests" className="admin-nav-item">Заявки ({data.requests?.length || 0})</Link>
          <Link to="/admin/contacts" className="admin-nav-item">Контакты</Link>
          <div style={{ padding: '20px 40px 10px', fontSize: '10px', color: '#444', textTransform: 'uppercase', letterSpacing: '2px' }}>Категории</div>
          {data.categories.map(cat => (
            <Link key={cat.id} to={`/admin/category/${cat.id}`} className="admin-nav-item">
              {cat.title}
            </Link>
          ))}
          <Link to="/" className="admin-nav-item" style={{ marginTop: 'auto', color: 'var(--accent)' }}>← На сайт</Link>
        </nav>
      </div>

      <div className="admin-main">
        <Routes>
          <Route path="/" element={<AdminGeneral data={data} setData={setData} />} />
          <Route path="/requests" element={<AdminRequests data={data} setData={setData} />} />
          <Route path="/contacts" element={<AdminContacts data={data} setData={setData} />} />
          <Route path="/category/:catId" element={<AdminCategory data={data} setData={setData} />} />
        </Routes>
      </div>
    </div>
  );
};

const AdminGeneral = ({ data, setData }) => {
  const [form, setForm] = useState(data.header);
  const save = () => {
    setData({ ...data, header: form });
    alert('Сохранено');
  };
  return (
    <div className="admin-card">
      <h2 style={{ border: 'none', padding: 0, marginBottom: '32px', color: 'var(--accent)' }}>Общие настройки</h2>
      <div className="form-group">
        <label>Название бренда</label>
        <input className="form-input" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
      </div>
      <div className="form-group">
        <label>Слоган</label>
        <textarea className="form-input" rows="3" value={form.slogan} onChange={e => setForm({ ...form, slogan: e.target.value })} />
      </div>
      <button className="btn-main" onClick={save}>Сохранить</button>
    </div>
  );
};

const AdminRequests = ({ data, setData }) => {
  const deleteRequest = (id) => {
    setData({ ...data, requests: data.requests.filter(r => r.id !== id) });
  };
  return (
    <div className="admin-card">
      <h2 style={{ border: 'none', padding: 0, marginBottom: '32px', color: 'var(--accent)' }}>Заявки</h2>
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Имя</th>
              <th>Телефон</th>
              <th>Действие</th>
            </tr>
          </thead>
          <tbody>
            {(data.requests || []).map(req => (
              <tr key={req.id}>
                <td style={{ color: '#666', fontSize: '12px' }}>{req.date}</td>
                <td style={{ fontWeight: '600' }}>{req.name}</td>
                <td>{req.phone}</td>
                <td>
                  <button className="action-btn" style={{ color: '#ff4444', borderColor: 'rgba(255,68,68,0.2)' }} onClick={() => deleteRequest(req.id)}>Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!data.requests || data.requests.length === 0) && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#444' }}>Заявок пока нет</div>
        )}
      </div>
    </div>
  );
};

const AdminContacts = ({ data, setData }) => {
  const [form, setForm] = useState(data.contacts);
  const save = () => {
    setData({ ...data, contacts: form });
    alert('Контакты обновлены');
  };
  return (
    <div className="admin-card">
      <h2 style={{ border: 'none', padding: 0, marginBottom: '32px', color: 'var(--accent)' }}>Контакты</h2>
      <div className="form-group">
        <label>Телефон</label>
        <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className="form-group">
        <label>Instagram URL</label>
        <input className="form-input" value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} />
      </div>
      <div className="form-group">
        <label>Telegram URL</label>
        <input className="form-input" value={form.telegram} onChange={e => setForm({ ...form, telegram: e.target.value })} />
      </div>
      <button className="btn-main" onClick={save}>Сохранить</button>
    </div>
  );
};

const AdminCategory = ({ data, setData }) => {
  const { catId } = useParams();
  const category = data.categories.find(c => c.id === catId);
  const [editingItem, setEditingItem] = useState(null);

  if (!category) return <div>Категория не найдена</div>;

  const saveItem = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newItem = {
      id: editingItem?.id || Date.now(),
      name: formData.get('name'),
      code: formData.get('code'),
      price: formData.get('price'),
      image: formData.get('image_url') || editingItem?.image || '',
      description: formData.get('description')
    };
    const newCats = data.categories.map(c => {
      if (c.id === catId) {
        const items = editingItem?.id ? c.items.map(i => i.id === editingItem.id ? newItem : i) : [...c.items, newItem];
        return { ...c, items };
      }
      return c;
    });
    setData({ ...data, categories: newCats });
    setEditingItem(null);
  };

  const deleteItem = (id) => {
    if (window.confirm('Удалить товар?')) {
      const newCats = data.categories.map(c => {
        if (c.id === catId) return { ...c, items: c.items.filter(i => i.id !== id) };
        return c;
      });
      setData({ ...data, categories: newCats });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h2 style={{ color: 'var(--accent)', border: 'none', padding: 0 }}>{category.title}</h2>
        <button className="btn-main" onClick={() => setEditingItem({})}>+ Добавить товар</button>
      </div>

      {editingItem && (
        <div className="admin-card" style={{ marginBottom: '40px', border: '1px solid var(--accent)' }}>
          <h3>{editingItem.id ? 'Редактировать' : 'Новый товар'}</h3>
          <form onSubmit={saveItem} style={{ marginTop: '20px' }}>
            <div className="form-group"><label>Название</label><input name="name" className="form-input" defaultValue={editingItem.name} required /></div>
            <div className="form-group"><label>Артикул</label><input name="code" className="form-input" defaultValue={editingItem.code} /></div>
            <div className="form-group"><label>Цена</label><input name="price" className="form-input" defaultValue={editingItem.price} /></div>
            <div className="form-group"><label>URL Изображения</label><input name="image_url" className="form-input" defaultValue={editingItem.image} /></div>
            <div className="form-group"><label>Описание</label><textarea name="description" className="form-input" defaultValue={editingItem.description} /></div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn-main">Сохранить</button>
              <button type="button" className="btn-main" style={{ background: '#333', color: '#fff' }} onClick={() => setEditingItem(null)}>Отмена</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        <table className="admin-table">
          <thead><tr><th>Наименование</th><th>Артикул</th><th>Цена</th><th>Действия</th></tr></thead>
          <tbody>
            {category.items.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td><td>{item.code}</td><td>{item.price} SUM</td>
                <td>
                  <button className="action-btn" onClick={() => setEditingItem(item)}>Ред.</button>
                  <button className="action-btn" style={{ color: '#ff4444' }} onClick={() => deleteItem(item.id)}>Удал.</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MainApp = () => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialData;
  });
  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(data)), [data]);
  return (<Router><Routes><Route path="/" element={<Landing data={data} setData={setData} />} /><Route path="/admin/*" element={<Admin data={data} setData={setData} />} /></Routes></Router>);
};

export default MainApp;

