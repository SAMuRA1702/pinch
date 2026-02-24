import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { Instagram, Send } from 'lucide-react'; // Send used for Telegram icon

// --- DATA PERSISTENCE (Simulation) ---
const STORAGE_KEY = 'pinch_drop_data';

const initialData = {
  header: {
    brand: '▲ PINCH & DROP •',
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
    },
    {
      id: 'toppings',
      title: 'Топпинги',
      meta: 'пластик | 1 л | 24 месяца',
      description: 'Идеальное дополнение к десертам и напиткам.',
      items: []
    },
    {
      id: 'bases',
      title: 'Основы',
      meta: 'стекло | 1 л | 24 месяца',
      description: 'Универсальные концентраты для ваших коктейлей.',
      items: []
    }
  ],
  contacts: {
    phone: '+7 (495) 431-90-60',
    email: 'export@complexbar.com',
    instagram: '',
    telegram: ''
  },
  requests: []
};

// --- COMPONENTS ---

// 1. PUBLIC LANDING PAGE
const Landing = ({ data, setData }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [callbackForm, setCallbackForm] = useState({ name: '', phone: '' });
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    const hasToppings = data.categories.some(c => c.id === 'toppings');
    const hasBases = data.categories.some(c => c.id === 'bases');
    if (!hasToppings || !hasBases) {
      const updatedCats = [...data.categories];
      if (!hasToppings) updatedCats.push(initialData.categories[2]);
      if (!hasBases) updatedCats.push(initialData.categories[3]);
      setData({ ...data, categories: updatedCats });
    }
  }, []);

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
          <div className="logo-section">
            <div className="brand-name">{data.header.brand}</div>
          </div>
          <div className="slogan-box">
            <p className="slogan-text">{data.header.slogan}</p>
          </div>
        </div>
      </header>

      <main className="container">
        {data.categories.map((cat) => (
          <section key={cat.id}>
            <div className="category-block">
              <div className="category-header">
                <h2 className="category-title">{cat.title}</h2>
                <div className="category-meta">{cat.meta}</div>
              </div>
              <p style={{ marginBottom: '30px', color: '#555', fontSize: '14px', maxWidth: '800px' }}>{cat.description}</p>
              {cat.items.length > 0 ? (
                <div className="product-grid">
                  {cat.items.map((item) => (
                    <div key={item.id} className="product-item" onClick={() => setSelectedProduct({ ...item, categoryMeta: cat.meta })}>
                      <div className="product-placeholder">
                        {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
                      </div>
                      <div className="product-name">{item.name}</div>
                      <div className="product-code">{item.code}</div>
                      {item.price && <div style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '5px' }}>{item.price} SUM</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ opacity: 0.3, fontSize: '12px' }}>Товары в данной категории пока отсутствуют.</div>
              )}
            </div>
          </section>
        ))}
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProduct(null)}>×</button>
            <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9', borderRadius: '4px', minHeight: '300px' }}>
              {selectedProduct.image ? (
                <img src={selectedProduct.image} alt={selectedProduct.name} style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', display: 'block' }} />
              ) : (
                <div className="product-placeholder" style={{ transform: 'scale(2)', marginBottom: 0 }}></div>
              )}
            </div>
            <div style={{ flex: '1' }}>
              <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', marginBottom: '10px' }}>{selectedProduct.categoryMeta}</div>
              <h2 style={{ border: 'none', padding: 0, marginBottom: '20px', fontSize: '28px' }}>{selectedProduct.name}</h2>
              <div style={{ fontSize: '14px', color: '#888', marginBottom: '20px' }}>Артикул: {selectedProduct.code}</div>
              {selectedProduct.price && (
                <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '30px' }}>{selectedProduct.price} SUM</div>
              )}
              {selectedProduct.description && (
                <div>
                  <h4 style={{ textTransform: 'uppercase', fontSize: '10px', marginBottom: '10px', letterSpacing: '1px' }}>Описание:</h4>
                  <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>{selectedProduct.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-info">
              <h3 style={{ fontSize: '18px', marginBottom: '20px', textTransform: 'uppercase' }}>Заказать обратный звонок</h3>
              <form onSubmit={handleCallback} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                <input
                  type="text"
                  placeholder="Ваше имя"
                  className="form-input"
                  required
                  value={callbackForm.name}
                  onChange={e => setCallbackForm({ ...callbackForm, name: e.target.value })}
                  style={{ border: '1px solid #ddd', padding: '10px' }}
                />
                <input
                  type="tel"
                  placeholder="Номер телефона"
                  className="form-input"
                  required
                  value={callbackForm.phone}
                  onChange={e => setCallbackForm({ ...callbackForm, phone: e.target.value })}
                  style={{ border: '1px solid #ddd', padding: '10px' }}
                />
                <button type="submit" className="btn-main" style={{ background: 'black', color: 'white', border: 'none', padding: '12px', cursor: 'pointer', fontWeight: '800' }}>
                  ОТПРАВИТЬ
                </button>
                {isSent && <div style={{ color: 'green', fontSize: '12px', fontWeight: 'bold', marginTop: '5px' }}>Спасибо! Мы свяжемся с вами.</div>}
              </form>
            </div>
            <div className="footer-contacts">
              <h3 style={{ fontSize: '18px', marginBottom: '20px', textTransform: 'uppercase' }}>Связаться с нами</h3>
              <div className="contact-links">
                <a href={`tel:${data.contacts.phone}`} style={{ fontSize: '18px', marginBottom: '5px' }}>{data.contacts.phone}</a>
                <a href={`mailto:${data.contacts.email}`}>{data.contacts.email}</a>

                <div className="social-icons-row">
                  {data.contacts.instagram && (
                    <a href={data.contacts.instagram} target="_blank" rel="noreferrer" className="social-icon-link instagram">
                      <Instagram size={20} />
                    </a>
                  )}
                  {data.contacts.telegram && (
                    <a href={data.contacts.telegram} target="_blank" rel="noreferrer" className="social-icon-link telegram">
                      <Send size={20} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '60px', opacity: 0.5, fontSize: '11px', textAlign: 'center' }}>
            © {new Date().getFullYear()} PINCH & DROP. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
};

// 2. ADMIN PANEL
const Admin = ({ data, setData }) => {
  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <h1>PINCH ADMIN</h1>
        <nav>
          <Link to="/admin" className="admin-nav-item">Общее</Link>
          <Link to="/admin/requests" className="admin-nav-item">Заявки ({data.requests?.length || 0})</Link>
          <Link to="/admin/contacts" className="admin-nav-item">Контакты</Link>
          <div style={{ marginTop: '20px', marginBottom: '10px', fontSize: '10px', color: '#666', borderBottom: '1px solid #222' }}>КАТЕГОРИИ</div>
          {data.categories.map(cat => (
            <Link key={cat.id} to={`/admin/category/${cat.id}`} className="admin-nav-item">
              {cat.title}
            </Link>
          ))}
          <Link to="/" className="admin-nav-item" style={{ marginTop: '40px', color: '#ff7e45' }}>← На сайт</Link>
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
      <h2 style={{ border: 'none', padding: 0 }}>Общие настройки</h2>
      <div className="form-group">
        <label>Название бренда</label>
        <input className="form-input" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
      </div>
      <div className="form-group">
        <label>Слоган</label>
        <textarea className="form-input" rows="3" value={form.slogan} onChange={e => setForm({ ...form, slogan: e.target.value })} />
      </div>
      <button className="btn-save" onClick={save}>Сохранить изменения</button>
    </div>
  );
};

const AdminRequests = ({ data, setData }) => {
  const clearRequests = () => {
    if (window.confirm('Очистить все заявки?')) setData({ ...data, requests: [] });
  };
  const deleteRequest = (id) => {
    setData({ ...data, requests: data.requests.filter(r => r.id !== id) });
  };
  return (
    <div className="admin-card">
      <div className="admin-header">
        <h2 style={{ border: 'none', padding: 0 }}>Заявки на обратный звонок</h2>
        <button className="action-btn delete-btn" onClick={clearRequests}>Очистить список</button>
      </div>
      <div className="admin-table-wrapper">
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
                <td style={{ fontSize: '12px' }}>{req.date}</td>
                <td style={{ fontWeight: 'bold' }}>{req.name}</td>
                <td>{req.phone}</td>
                <td>
                  <button className="action-btn delete-btn" onClick={() => deleteRequest(req.id)}>Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!data.requests || data.requests.length === 0) && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Заявок пока нет</div>
        )}
      </div>
    </div>
  );
};

const AdminContacts = ({ data, setData }) => {
  const [form, setForm] = useState({
    phone: data.contacts.phone || '',
    email: data.contacts.email || '',
    instagram: data.contacts.instagram || '',
    telegram: data.contacts.telegram || ''
  });

  const save = () => {
    setData({ ...data, contacts: form });
    alert('Контакты обновлены');
  };

  return (
    <div className="admin-card">
      <h2 style={{ border: 'none', padding: 0 }}>Редактирование контактов</h2>
      <div className="form-group">
        <label>Телефон</label>
        <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className="form-group">
        <label>Ссылка Instagram</label>
        <input className="form-input" value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="https://instagram.com/..." />
      </div>
      <div className="form-group">
        <label>Ссылка Telegram</label>
        <input className="form-input" value={form.telegram} onChange={e => setForm({ ...form, telegram: e.target.value })} placeholder="https://t.me/..." />
      </div>
      <button className="btn-save" onClick={save}>Сохранить контакты</button>
    </div>
  );
};

const AdminCategory = ({ data, setData }) => {
  const { catId } = useParams();
  const category = data.categories.find(c => c.id === catId);
  const [editingItem, setEditingItem] = useState(null);
  const [tempImage, setTempImage] = useState('');

  if (!category) return <div>Категория не найдена</div>;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTempImage(reader.result);
      reader.readAsDataURL(file);
    }
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

  const saveItem = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newItem = {
      id: editingItem?.id || Date.now(),
      name: formData.get('name'),
      code: formData.get('code'),
      price: formData.get('price'),
      image: tempImage || formData.get('image_url') || editingItem?.image || '',
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
    setTempImage('');
  };

  return (
    <div>
      <div className="admin-header">
        <h2>{category.title}</h2>
        <button className="btn-save" onClick={() => { setEditingItem({}); setTempImage(''); }}>+ Добавить товар</button>
      </div>
      {editingItem && (
        <div className="admin-card" style={{ marginBottom: '30px', border: '2px solid #000' }}>
          <h3>{editingItem.id ? 'Редактировать' : 'Новый товар'}</h3>
          <form onSubmit={saveItem}>
            <div className="form-group"><label>Название</label><input name="name" className="form-input" defaultValue={editingItem.name} required /></div>
            <div className="form-group"><label>Артикул</label><input name="code" className="form-input" defaultValue={editingItem.code} /></div>
            <div className="form-group"><label>Цена (SUM)</label><input name="price" className="form-input" defaultValue={editingItem.price} /></div>
            <div className="form-group"><label>Изображение (Файл)</label><input type="file" className="form-input" onChange={handleFileChange} accept="image/*" /></div>
            <div className="form-group"><label>Либо URL Изображения</label><input name="image_url" className="form-input" defaultValue={editingItem.image?.startsWith('http') ? editingItem.image : ''} /></div>
            {(tempImage || editingItem.image) && <img src={tempImage || editingItem.image} alt="preview" style={{ maxHeight: '100px', display: 'block', marginBottom: '20px' }} />}
            <div className="form-group"><label>Описание</label><textarea name="description" className="form-input" defaultValue={editingItem.description} /></div>
            <button type="submit" className="btn-save">Сохранить</button>
            <button type="button" className="action-btn" onClick={() => setEditingItem(null)} style={{ marginLeft: '10px' }}>Отмена</button>
          </form>
        </div>
      )}
      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead><tr><th>Наименование</th><th>Артикул</th><th>Цена</th><th>Действия</th></tr></thead>
            <tbody>
              {category.items.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td><td>{item.code}</td><td>{item.price} SUM</td>
                  <td><button className="action-btn" onClick={() => { setEditingItem(item); setTempImage(''); }}>Ред.</button><button className="action-btn delete-btn" onClick={() => deleteItem(item.id)}>Удал.</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
