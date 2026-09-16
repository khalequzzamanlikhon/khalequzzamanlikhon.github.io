// ============================================
// Khalequzzaman Likhon — Portfolio JavaScript
// ============================================

// ----- Theme -----
// The initial theme is set by an inline script in <head> to avoid a flash.
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('theme', theme); } catch (e) {}
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#000000' : '#f5f3ee');
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.setAttribute('aria-pressed', String(theme === 'dark'));
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  });
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
}

// ----- Mobile menu -----
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  const btn = document.querySelector('.menu-btn');
  if (!menu) return;
  menu.hidden = !menu.hidden;
  if (btn) btn.setAttribute('aria-expanded', String(!menu.hidden));
}

// ----- List filters (projects, publications, writing, news) -----
// Topic chips: <div data-filter-for="listId"> containing <button class="chip" data-filter="x">
// Dropdowns:   <select data-filter-list="listId">
// Search:      <input data-search-for="listId">, plus an optional <p data-empty-for="listId">
// Items carry data-type="a b c" (or are .pub entries). Groups (.project-group,
// [data-search-group]) hide when none of their items are showing.
const ITEM_SEL = '[data-type], .pub';

function applyListFilter(list) {
  const f = list.dataset.filter || 'all';
  const query = list.dataset.query || '';
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const items = [...list.querySelectorAll(ITEM_SEL)].filter(el => !el.querySelector(ITEM_SEL));
  let shown = 0;
  items.forEach(item => {
    const types = (item.dataset.type || '').split(' ');
    const text = item.textContent.toLowerCase();
    item.hidden = !((f === 'all' || types.includes(f)) && terms.every(t => text.includes(t)));
    if (!item.hidden) shown++;
  });
  list.querySelectorAll('.project-group, [data-search-group]').forEach(group => {
    group.hidden = !items.some(item => !item.hidden && group.contains(item));
  });
  const empty = document.querySelector(`[data-empty-for="${list.id}"]`);
  if (empty) {
    empty.hidden = shown > 0 || !terms.length;
    const term = empty.querySelector('.search-term');
    if (term) term.textContent = query;
  }
}

function initFilters() {
  document.querySelectorAll('[data-filter-for]').forEach(bar => {
    const list = document.getElementById(bar.dataset.filterFor);
    if (!list) return;
    bar.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      bar.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', 'false'));
      chip.setAttribute('aria-pressed', 'true');
      list.dataset.filter = chip.dataset.filter;
      applyListFilter(list);
    });
  });

  document.querySelectorAll('select[data-filter-list]').forEach(select => {
    const list = document.getElementById(select.dataset.filterList);
    if (!list) return;
    select.addEventListener('change', () => {
      list.dataset.filter = select.value;
      applyListFilter(list);
    });
  });

  document.querySelectorAll('input[data-search-for]').forEach(input => {
    const list = document.getElementById(input.dataset.searchFor);
    if (!list) return;
    const update = () => {
      list.dataset.query = input.value.trim();
      applyListFilter(list);
    };
    input.addEventListener('input', update);
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') { input.value = ''; update(); }
    });
    const clear = document.querySelector(`[data-empty-for="${list.id}"] .search-clear`);
    if (clear) clear.addEventListener('click', () => { input.value = ''; update(); input.focus(); });
    if (input.value) update(); // the browser may restore a typed query on back/forward
  });
}

// ----- Scroll reveal -----
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.08 });
  els.forEach(el => io.observe(el));
}

// ----- Init -----
document.addEventListener('DOMContentLoaded', () => {
  setTheme(document.documentElement.getAttribute('data-theme') || 'light');
  document.querySelectorAll('.theme-toggle').forEach(b => b.addEventListener('click', toggleTheme));
  const menuBtn = document.querySelector('.menu-btn');
  if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  initFilters();
  initReveal();
});
