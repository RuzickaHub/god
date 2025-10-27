/*
  Hlavní JavaScript soubor pro UDF Dokumentaci
  Obsluhuje načítání obsahu, navigaci, tmavý režim a mobilní menu.
*/

// Konstanta pro základní URL GitHub repozitáře, odkud se stahují .md soubory
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/RuzickaHub/UDF/main/docs/';

// Definice stránek a jejich souborů
const PAGES = [
  { file: 'intro.md', title: 'Úvod' },
  { file: 'installation.md', title: 'Instalace' },
  { file: 'usage.md', title: 'Použití' },
  { file: 'api.md', title: 'API' }
];

/**
 * Vygeneruje navigační odkazy v postranním panelu na základě pole PAGES.
 */
function createNav() {
  const nav = document.getElementById('navlist');
  if (!nav) return;
  nav.innerHTML = ''; // Vyčistit existující obsah

  PAGES.forEach(p => {
    const a = document.createElement('a');
    a.href = '#' + p.file;
    a.textContent = p.title;
    a.setAttribute('data-file', p.file);
    
    // Přidá posluchač kliknutí pro SPA navigaci
    a.addEventListener('click', (e) => {
      e.preventDefault(); // Zabrání výchozímu přechodu
      closeSidebarIfMobile(); // Zavře menu na mobilu
      loadPage(p.file); // Načte nový obsah
      history.pushState({ page: p.file }, '', '#' + p.file); // Aktualizuje URL
    });
    nav.appendChild(a);
  });
  
  setActiveLinkFromHash(); // Nastaví aktivní odkaz při prvním načtení
}

/**
 * Nastaví třídu 'active' na správný odkaz v navigaci.
 * @param {string} filename - Název souboru aktivní stránky.
 */
function setActiveLink(filename) {
  document.querySelectorAll('#navlist a').forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('data-file') === filename) {
      a.classList.add('active');
    }
  });
}

/**
 * Zjistí aktivní stránku z URL (hashe) a nastaví ji.
 */
function setActiveLinkFromHash() {
  const file = location.hash.replace('#', '') || PAGES[0].file;
  setActiveLink(file);
}

/**
 * Asynchronně stáhne Markdown soubor.
 * Nejprve zkusí GitHub, při selhání zkusí lokální složku /docs/.
 * @param {string} file - Název souboru (např. 'intro.md').
 * @returns {Promise<string>} - Textový obsah Markdown souboru.
 */
async function fetchMarkdown(file) {
  const url = GITHUB_RAW_BASE + file;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Remote not available');
    return await res.text();
  } catch (err) {
    console.warn('Remote fetch failed, trying local fallback', err);
    // Záložní (fallback) cesta
    try {
      const local = await fetch('docs/' + file); // Předpokládá složku /docs/
      if (!local.ok) throw new Error('Local fallback missing');
      return await local.text();
    } catch (e) {
      console.error('Local fallback failed', e);
      return '# Chyba načtení\n\nObsah není dostupný ani vzdáleně, ani lokálně.';
    }
  }
}

/**
 * Načte Markdown soubor, převede ho na HTML a vloží do stránky.
 * @param {string} file - Název souboru k načtení.
 */
async function loadPage(file) {
  const contentEl = document.getElementById('content');
  if (!contentEl) return;
  
  // Zobrazit indikátor načítání
  contentEl.innerHTML = '<h2>Načítání...</h2>';

  try {
    const rawMd = await fetchMarkdown(file);
    // Použije knihovnu 'marked' (načtenou v HTML) pro převod
    const html = marked.parse(rawMd); 
    
    contentEl.innerHTML = html;
    
    // Aktualizuje titulek stránky
    const pageTitle = PAGES.find(p => p.file === file)?.title || 'Documentation';
    document.title = `${pageTitle} – UDF`;

    setActiveLink(file); // Zvýrazní odkaz v navigaci
    window.scrollTo(0, 0); // Scrolluje na začátek stránky
  } catch (error) {
    contentEl.innerHTML = '<h2>Chyba</h2><p>Nepodařilo se načíst obsah.</p>';
  }
}

/**
 * Nastaví funkčnost přepínače světlého/tmavého motivu.
 */
function setupTheme() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  // Zjistí preferenci ze systému nebo localStorage
  const preferred = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem('udf-theme');

  if (saved === 'dark' || (!saved && preferred)) {
    document.body.classList.add('dark');
    btn.setAttribute('aria-pressed', 'true');
  } else {
    document.body.classList.remove('dark');
    btn.setAttribute('aria-pressed', 'false');
  }

  // Přidá posluchač kliknutí na tlačítko
  btn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    localStorage.setItem('udf-theme', isDark ? 'dark' : 'light');
  });
}

/**
 * Nastaví funkčnost mobilního menu (otevírání/zavírání).
 */
function setupMobileMenu() {
  const openBtn = document.getElementById('mobile-menu-open');
  const closeBtn = document.getElementById('mobile-menu-close');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  
  if (!openBtn || !closeBtn || !sidebar || !overlay) return;

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // Zabrání scrollu stránky
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = ''; // Povolí scroll
  }

  openBtn.addEventListener('click', openSidebar);
  closeBtn.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar); // Zavření kliknutím na overlay
  
  // Zavření pomocí klávesy Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
      closeSidebar();
    }
  });

  // Globální funkce pro zavření menu (volá se při kliknutí na odkaz)
  window.closeSidebarIfMobile = function() {
    if (window.innerWidth <= 1024) {
      closeSidebar();
    }
  };
}

// --- Posluchače událostí ---

/**
 * Reaguje na tlačítka Zpět/Vpřed v prohlížeči.
 */
window.addEventListener('popstate', (e) => {
  const page = (e.state && e.state.page) || location.hash.replace('#', '') || PAGES[0].file;
  loadPage(page);
});

/**
 * Spustí inicializaci aplikace po načtení DOM.
 */
document.addEventListener('DOMContentLoaded', () => {
  createNav();
  setupTheme();
  setupMobileMenu();
  
  // Načte úvodní stránku podle URL (nebo první v pořadí)
  const initial = location.hash.replace('#', '') || PAGES[0].file;
  loadPage(initial);
});
