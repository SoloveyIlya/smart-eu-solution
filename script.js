// script.js — финальная минимальная версия без зависимостей от события 'scroll'
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('#main-header, .site-header');
  const burger = document.querySelector('.burger-menu');
  const nav    = document.querySelector('.nav-links');

  // --- УСТОЙЧИВЫЙ КОНТРОЛЛЕР ПРОКРУТКИ (без window.addEventListener('scroll')) ---
  let lastY = -1;
  const tick = () => {
    const y = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (y !== lastY) {
      if (header) header.classList.toggle('scrolled', y > 50);
      lastY = y;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // --- ПЛАВНЫЕ ЯКОРЯ ---
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // --- БУРГЕР-МЕНЮ ---
  if (burger && nav) {
    const toggle = (open) => {
      burger.classList.toggle('active', open);
      nav.classList.toggle('active', open);
      header.classList.toggle('menu-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => toggle(!burger.classList.contains('active')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) toggle(false); });
    document.addEventListener('click', (e) => {
      if (!burger.contains(e.target) && !nav.contains(e.target)) toggle(false);
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 768) toggle(false); });
  }
});