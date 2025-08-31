// Inject header & footer partials, support theme + active link
(() => {
  const PREF_KEY = 'fuel-theme'; // 'light' | 'dark' | 'auto'

  async function inject(where, url){
    const host = document.querySelector(`[data-include="${where}"]`);
    if(!host) return;
    try{
      const res = await fetch(url, {cache: 'no-store'});
      host.innerHTML = res.ok ? await res.text() : `<!-- failed to load ${url} -->`;
      if(where === 'header') afterHeaderInjected(host);
    }catch(e){ host.innerHTML = `<!-- include error: ${url} -->`; }
  }

  function afterHeaderInjected(scope){
    // active link underline
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    scope.querySelectorAll('a[href]').forEach(a => {
      const href = (a.getAttribute('href') || '').toLowerCase();
      if(!href || href.startsWith('#') || href.startsWith('http')) return;
      const file = href.replace('./','').replace('/','');
      if ((path === '' && file === 'index.html') || path === file) a.classList.add('active');
    });

    // theme toggle
    const root = document.documentElement;
    const btn = scope.querySelector('#themeToggle');
    const apply = (pref) => {
      if (pref === 'light' || pref === 'dark') root.setAttribute('data-theme', pref);
      else root.removeAttribute('data-theme');
      if (btn) btn.textContent = pref === 'auto' ? 'Auto' : (pref[0].toUpperCase() + pref.slice(1));
    };
    const get = () => localStorage.getItem(PREF_KEY) || 'auto';
    const set = (p) => { localStorage.setItem(PREF_KEY, p); apply(p); };
    apply(get());
    if (btn) btn.addEventListener('click', () => {
      const cur = get();
      const next = cur === 'light' ? 'dark' : (cur === 'dark' ? 'auto' : 'light');
      set(next);
    });

    // mobile menu
    const menuBtn = scope.querySelector('#menuToggle');
    const panel = document.getElementById('mobilePanel');
    if(menuBtn && panel){ menuBtn.addEventListener('click', () => panel.classList.toggle('open')); }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const base = document.body.getAttribute('data-base') || ''; // set e.g. "../" on nested pages
    inject('header', `${base}partials/header.html`);
    inject('footer', `${base}partials/footer.html`);
    const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
  });
})();

