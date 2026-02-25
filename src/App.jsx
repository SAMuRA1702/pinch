import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { Instagram, Send, X, Phone, Mail, ChevronRight, ArrowRight, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// --- DATA PERSISTENCE ---
const STORAGE_KEY = 'pinch_drop_data_v3';

const initialData = {
  header: {
    brand: 'PINCH & DROP',
    slogan: 'Архитекторы вкуса. Натуральные ингредиенты. Оригинальные рецептуры сиропов и основ.'
  },
  categories: [
    {
      id: 'syrups',
      title: 'Сиропы',
      meta: 'Стекло | 1 л | 24 мес.',
      description: 'Высококонцентрированные вкусы для профессиональной миксологии.',
      items: [
        { id: 1, name: 'Амаретто', code: '5034506', price: '750', image: '' },
        { id: 2, name: 'Яблочный пирог', code: '5030911', price: '750', image: '' },
        { id: 4, name: 'Соленая карамель', code: '5030912', price: '820', image: '' },
        { id: 5, name: 'Ваниль', code: '5030913', price: '790', image: '' },
        { id: 6, name: 'Кокос', code: '5030914', price: '750', image: '' },
        { id: 7, name: 'Лесной орех', code: '5030915', price: '750', image: '' }
      ]
    },
    {
      id: 'pures',
      title: 'Пюре',
      meta: 'Фрукты | 1 л | 12 мес.',
      description: '70% содержания натуральных фруктов. Почувствуйте вкус природы.',
      items: [
        { id: 3, name: 'Банан', code: '5045174', price: '1200', image: '' },
        { id: 8, name: 'Малина', code: '5045175', price: '1450', image: '' },
        { id: 9, name: 'Манго', code: '5045176', price: '1600', image: '' }
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

// --- BACKGROUND 3D COMPONENT ---
function BackgroundScene() {
  const pointsRef = useRef();
  const sphereRef = useRef();
  const [scrollVelocity, setScrollVelocity] = useState(0);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Плавное затухание скорости скролла
    setScrollVelocity(prev => prev * 0.95);

    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.05 + scrollVelocity * 0.001;
      pointsRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
    }
    if (sphereRef.current) {
      // Сфера деформируется сильнее при быстром скролле
      sphereRef.current.distort = 0.4 + Math.abs(scrollVelocity) * 0.0005;
      sphereRef.current.speed = 2 + Math.abs(scrollVelocity) * 0.001;
    }
  });

  // Ловим событие скролла для Three.js
  useEffect(() => {
    const handleScroll = (e) => setScrollVelocity(window.scrollY - (window.lastY || 0));
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const particles = useMemo(() => {
    const count = 3000; // Больше частиц для плотности
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return positions;
  }, []);

  return (
    <group>
      <Points ref={pointsRef} positions={particles} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#c5a059"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      <Float speed={5} rotationIntensity={2} floatIntensity={2}>
        <Sphere args={[1.2, 128, 128]} position={[2, -0.5, -2]}>
          <MeshDistortMaterial
            ref={sphereRef}
            color="#c5a059"
            distort={0.5}
            speed={2}
            roughness={0.1}
            metalness={1}
            emissive="#221100"
            emissiveIntensity={0.5}
          />
        </Sphere>
      </Float>
    </group>
  );
}

// --- MAIN LANDING PAGE ---
const Landing = ({ data, setData }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const heroRef = useRef();
  const titleRef = useRef();

  useEffect(() => {
    // Lenis Smooth Scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      window.lastY = window.scrollY; // Сохраняем для 3D деформации
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Hero Text Animation
    if (titleRef.current) {
      gsap.fromTo(titleRef.current,
        { y: 200, skewY: 10, opacity: 0 },
        { y: 0, skewY: 0, opacity: 1, duration: 1.5, ease: "power4.out", delay: 0.5 }
      );
    }

    return () => lenis.destroy();
  }, []);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cursorRef = useRef();

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (cursorRef.current) {
        const isHovering = e.target.closest('button, a, .bento-item, input');
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          scale: isHovering ? 2.5 : 1,
          duration: 0.8,
          ease: "power3.out"
        });
      }
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--x', `${x}%`);
    e.currentTarget.style.setProperty('--y', `${y}%`);

    // Находим внутренний элемент для трансформации
    const target = e.currentTarget.querySelector('.bento-inner');
    if (!target) return;

    // Нормализованный наклон (эффект одинаков для всех размеров)
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const percentX = (e.clientX - centerX) / (rect.width / 2); // от -1 до 1
    const percentY = (e.clientY - centerY) / (rect.height / 2); // от -1 до 1

    const maxRotation = 4; // Максимальный угол наклона в градусах
    const rotateX = -(percentY * maxRotation);
    const rotateY = percentX * maxRotation;

    target.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
  };

  const handleMouseLeave = (e) => {
    const target = e.currentTarget.querySelector('.bento-inner');
    if (target) {
      target.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    }
  };

  const bentoGridConfig = (index) => {
    const patterns = ['item-large', 'item-small', 'item-medium', 'item-tall', 'item-small'];
    return patterns[index % patterns.length];
  };

  return (
    <div className="immersive-app">
      <div className="liquid-cursor" ref={cursorRef}></div>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <pointLight position={[-10, -10, -10]} />
          <BackgroundScene />
        </Canvas>
      </div>

      <section className="hero" ref={heroRef}>
        <div className="hero-title-wrapper">
          <h1 className="hero-title" ref={titleRef}>{data.header.brand}</h1>
        </div>
        <p style={{ marginTop: '20px', fontSize: '14px', letterSpacing: '2px', opacity: 0.5, textTransform: 'uppercase' }}>Архитекторы вкуса</p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={{ marginTop: '50px' }}
        >
          <div className="scroll-indicator">
            <div className="mouse"></div>
          </div>
        </motion.div>
      </section>

      <nav className="category-nav">
        {data.categories.map(cat => (
          <a key={cat.id} href={`#${cat.id}`} className="nav-pill">{cat.title}</a>
        ))}
      </nav>

      <div className="bento-container">
        {data.categories.map((cat) => (
          <React.Fragment key={cat.id}>
            <div className="bento-header" id={cat.id} style={{ paddingBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <h2 className="bento-category-title">{cat.title}</h2>
                <span style={{ fontSize: '12px', padding: '4px 12px', background: 'var(--accent)', color: '#000', borderRadius: '20px', fontWeight: '700' }}>
                  {cat.items.length} позиций
                </span>
              </div>
              <p style={{ opacity: 0.4, maxWidth: '600px', fontSize: '14px' }}>{cat.description}</p>
              <div style={{ marginTop: '10px', fontSize: '10px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '2px' }}>{cat.meta}</div>
            </div>

            {cat.items.map((item, idx) => (
              <div
                key={item.id}
                className={`bento-item ${bentoGridConfig(idx)}`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={() => setSelectedProduct({ ...item, categoryMeta: cat.meta })}
                style={{ cursor: 'none' }}
              >
                <div className="bento-inner">
                  <div className="product-card">
                    <div className="product-image-container">
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ fontSize: '100px', opacity: 0.03, fontFamily: 'var(--font-display)', position: 'absolute' }}>{item.name.charAt(0)}</div>
                          <div style={{ fontSize: '10px', opacity: 0.2, fontWeight: '700', letterSpacing: '2px' }}>ФОТО В ОБРАБОТКЕ</div>
                        </div>
                      )}
                    </div>
                    <div className="product-info">
                      <div style={{ fontSize: '10px', opacity: 0.4, marginBottom: '4px' }}>АРТ. {item.code}</div>
                      <div className="product-name">{item.name}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="product-price">{item.price} СУМ</span>
                        <div className="btn-circle"><ArrowRight size={14} /></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      <footer style={{ padding: '10vw 4vw', background: 'transparent', position: 'relative', zIndex: 2 }}>
        <div className="bento-container" style={{ padding: 0 }}>
          {/* Левый блок: Форма */}
          <div className="bento-item" style={{ gridColumn: 'span 6', padding: '80px', background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <h2 className="bento-category-title" style={{ fontSize: '32px', marginBottom: '10px' }}>Напишите нам</h2>
            <p style={{ opacity: 0.5, marginBottom: '40px', fontSize: '14px' }}>Мы ответим вам в течение 15 минут</p>

            <form className="contact-form" onSubmit={e => e.preventDefault()}>
              <div className="form-group">
                <input type="text" className="form-input" placeholder=" " required />
                <label className="form-label">Ваше имя</label>
              </div>
              <div className="form-group">
                <input type="tel" className="form-input" placeholder=" " required />
                <label className="form-label">Телефон</label>
              </div>
              <button className="btn-main" style={{ borderRadius: '100px', padding: '20px 40px', fontSize: '12px', letterSpacing: '3px', width: 'auto', marginTop: '10px' }}>
                ОТПРАВИТЬ ЗАЯВКУ
              </button>
            </form>
          </div>

          {/* Правый блок: Контакты */}
          <div className="bento-item" style={{ gridColumn: 'span 6', padding: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(255,255,255,0.01)' }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <div style={{ marginBottom: '50px' }}>
              <div style={{ fontSize: '10px', color: 'var(--accent)', letterSpacing: '2px', marginBottom: '15px' }}>ГЛАВНЫЙ ОФИС</div>
              <a href={`tel:${data.contacts.phone}`} className="contact-value" style={{ fontSize: '32px' }}>{data.contacts.phone}</a>
            </div>
            <div style={{ marginBottom: '50px' }}>
              <div style={{ fontSize: '10px', color: 'var(--accent)', letterSpacing: '2px', marginBottom: '15px' }}>E-MAIL</div>
              <a href={`mailto:${data.contacts.email}`} className="contact-value" style={{ fontSize: '20px' }}>{data.contacts.email}</a>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <a href={data.contacts.instagram} className="social-link" target="_blank" rel="noreferrer" style={{ width: '50px', height: '50px' }}>
                <Instagram size={20} />
              </a>
              <a href={data.contacts.telegram} className="social-link" target="_blank" rel="noreferrer" style={{ width: '50px', height: '50px' }}>
                <Send size={20} />
              </a>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '100px', opacity: 0.2, fontSize: '12px', letterSpacing: '4px' }}>
          &copy; {new Date().getFullYear()} {data.header.brand.toUpperCase()} — ВСЕ ПРАВА ЗАЩИЩЕНЫ
        </div>
      </footer>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            className="immersive-modal"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ display: 'flex' }}
          >
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '40px', left: '40px', zIndex: 10 }}>
                <button onClick={() => setSelectedProduct(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={40} />
                </button>
              </div>
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
                {selectedProduct.image ? (
                  <img src={selectedProduct.image} style={{ maxHeight: '80%' }} />
                ) : (
                  <span style={{ fontSize: '10vw', opacity: 0.1, fontFamily: 'var(--font-display)' }}>PINCH & DROP</span>
                )}
              </div>
            </div>
            <div style={{ width: '40%', padding: '80px', background: '#000', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h4 style={{ color: 'var(--accent)', letterSpacing: '4px', textTransform: 'uppercase', fontSize: '12px', marginBottom: '20px' }}>{selectedProduct.categoryMeta}</h4>
              <h2 style={{ fontSize: '64px', fontFamily: 'var(--font-display)', marginBottom: '30px' }}>{selectedProduct.name}</h2>
              <p style={{ opacity: 0.5, marginBottom: '40px' }}>Артикул: {selectedProduct.code}</p>
              <div style={{ fontSize: '40px', fontWeight: '900', color: 'var(--accent)', marginBottom: '60px' }}>{selectedProduct.price} СУМ</div>
              <button className="btn-main" onClick={() => setSelectedProduct(null)}>Оформить предзаказ</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
};

// --- АДМИН-ПАНЕЛЬ (ПОЛНЫЙ ФУНКЦИОНАЛ) ---
const Admin = ({ data, setData }) => {
  const [activeTab, setActiveTab] = useState('catalog');

  const updateHeader = (field, value) => {
    setData({ ...data, header: { ...data.header, [field]: value } });
  };

  const deleteItem = (catId, itemId) => {
    const updatedCategories = data.categories.map(cat => {
      if (cat.id === catId) {
        return { ...cat, items: cat.items.filter(item => item.id !== itemId) };
      }
      return cat;
    });
    setData({ ...data, categories: updatedCategories });
  };

  const addCategory = () => {
    const title = prompt('Название новой категории (например, Топпинги):');
    if (!title) return;
    const id = title.toLowerCase().replace(/\s+/g, '-');
    setData({
      ...data,
      categories: [...data.categories, {
        id,
        title,
        meta: 'Новая категория',
        description: 'Описание категории...',
        items: []
      }]
    });
  };

  const deleteCategory = (id) => {
    if (!confirm('Удалить всю категорию и все товары в ней?')) return;
    setData({
      ...data,
      categories: data.categories.filter(cat => cat.id !== id)
    });
  };

  const updateCategory = (id, field, value) => {
    setData({
      ...data,
      categories: data.categories.map(cat => cat.id === id ? { ...cat, [field]: value } : cat)
    });
  };

  const addItem = (catId) => {
    const name = prompt('Название товара:');
    const price = prompt('Цена:');
    if (!name || !price) return;

    const updatedCategories = data.categories.map(cat => {
      if (cat.id === catId) {
        return {
          ...cat,
          items: [...cat.items, { id: Date.now(), name, price, code: 'NEW', image: '' }]
        };
      }
      return cat;
    });
    setData({ ...data, categories: updatedCategories });
  };

  return (
    <div className="admin-area" style={{ background: '#080808', minHeight: '100vh', color: '#fff', display: 'flex' }}>
      {/* Сайдбар */}
      <div style={{ width: '280px', background: '#000', borderRight: '1px solid var(--border)', padding: '40px 20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', marginBottom: '40px', color: 'var(--accent)' }}>PINCH & DROP</h2>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { id: 'header', label: 'Главный экран', icon: <Menu size={18} /> },
            { id: 'catalog', label: 'Каталог товаров', icon: <ArrowRight size={18} /> },
            { id: 'contacts', label: 'Контакты', icon: <Phone size={18} /> },
            { id: 'requests', label: 'Заявки', icon: <Mail size={18} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px',
                background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                border: 'none', color: activeTab === tab.id ? '#000' : '#888',
                borderRadius: '12px', textAlign: 'left', fontWeight: '600', transition: 'all 0.3s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        <Link to="/" style={{ marginTop: 'auto', padding: '15px 20px', color: '#555', textDecoration: 'none', fontSize: '14px' }}>
          ← Выйти на сайт
        </Link>
      </div>

      {/* Основной контент */}
      <div style={{ flex: 1, padding: '60px', overflowY: 'auto' }}>

        {/* РЕДАКТИРОВАНИЕ ЗАГОЛОВКОВ */}
        {activeTab === 'header' && (
          <div style={{ maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '40px' }}>Главный экран</h1>
            <div className="form-group">
              <label>Название бренда</label>
              <input
                value={data.header.brand}
                onChange={e => updateHeader('brand', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group" style={{ marginTop: '30px' }}>
              <label>Слоган</label>
              <textarea
                value={data.header.slogan}
                onChange={e => updateHeader('slogan', e.target.value)}
                className="form-input"
                style={{ height: '100px', resize: 'none' }}
              />
            </div>
          </div>
        )}

        {/* РЕДАКТИРОВАНИЕ КАТАЛОГА */}
        {activeTab === 'catalog' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <h1>Управление каталогом</h1>
              <button onClick={addCategory} className="btn-main" style={{ width: 'auto', padding: '15px 30px', background: '#fff', color: '#000' }}>
                + СОЗДАТЬ КАТЕГОРИЮ
              </button>
            </div>

            {data.categories.map(cat => (
              <div key={cat.id} style={{ marginBottom: '60px', background: '#000', padding: '40px', borderRadius: '32px', border: '1px solid var(--border)' }}>
                {/* Хедер категории */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #111', paddingBottom: '30px' }}>
                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--accent)', letterSpacing: '2px' }}>ЗАГОЛОВОК КАТЕГОРИИ</label>
                    <input
                      value={cat.title}
                      onChange={e => updateCategory(cat.id, 'title', e.target.value)}
                      style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #222', color: '#fff', width: '100%', fontSize: '24px', padding: '10px 0' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--accent)', letterSpacing: '2px' }}>МЕТА-ДАННЫЕ (ОБЪЕМ, ТАРА)</label>
                    <input
                      value={cat.meta}
                      onChange={e => updateCategory(cat.id, 'meta', e.target.value)}
                      style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #222', color: '#888', width: '100%', fontSize: '16px', padding: '10px 0' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '10px', color: 'var(--accent)', letterSpacing: '2px' }}>ОПИСАНИЕ</label>
                    <input
                      value={cat.description}
                      onChange={e => updateCategory(cat.id, 'description', e.target.value)}
                      style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #222', color: '#555', width: '100%', fontSize: '14px', padding: '10px 0' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '14px', letterSpacing: '2px' }}>ТОВАРЫ ({cat.items.length})</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => addItem(cat.id)} style={{ padding: '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+ Товар</button>
                    <button onClick={() => deleteCategory(cat.id)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', borderRadius: '8px', cursor: 'pointer' }}>Удалить категорию</button>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#555', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '15px 0' }}>НАЗВАНИЕ</th>
                      <th>АРТИКУЛ</th>
                      <th>ЦЕНА</th>
                      <th style={{ textAlign: 'right' }}>ДЕЙСТВИЯ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cat.items.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #111' }}>
                        <td style={{ padding: '20px 0', fontWeight: '600' }}>{item.name}</td>
                        <td style={{ color: '#555' }}>{item.code}</td>
                        <td style={{ color: 'var(--accent)' }}>{item.price} СУМ</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => deleteItem(cat.id, item.id)}
                            style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '12px' }}
                          >
                            УДАЛИТЬ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {/* СПИСОК ЗАЯВОК (ЛОГ) */}
        {activeTab === 'requests' && (
          <div>
            <h1 style={{ marginBottom: '40px' }}>Заявки клиентов</h1>
            <div style={{ background: '#000', padding: '40px', borderRadius: '24px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <p style={{ opacity: 0.3 }}>На данный момент новых заявок не поступало.</p>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div style={{ maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '40px' }}>Контакты</h1>
            <div className="form-group">
              <label>Телефон</label>
              <input value={data.contacts.phone} className="form-input" readOnly />
            </div>
            <div className="form-group" style={{ marginTop: '30px' }}>
              <label>Email</label>
              <input value={data.contacts.email} className="form-input" readOnly />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const MainApp = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загрузка данных с бэкенда при старте
  useEffect(() => {
    fetch('http://localhost:5000/api/data')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Ошибка загрузки:', err);
        setLoading(false);
      });
  }, []);

  // Функция для сохранения данных на бэкенд
  const persistData = (newData) => {
    setData(newData);
    fetch('http://localhost:5000/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData)
    });
  };

  if (loading || !data) {
    return (
      <div style={{ background: '#000', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontFamily: 'var(--font-display)', fontSize: '24px' }}>
        ЗАГРУЗКА ИММЕРСИВНОГО ОПЫТА...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing data={data} setData={persistData} />} />
        <Route path="/admin/*" element={<Admin data={data} setData={persistData} />} />
      </Routes>
    </Router>
  );
};

export default MainApp;
