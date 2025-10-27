document.addEventListener('DOMContentLoaded', () => {

    // --- KONFIGURACE ---
    
    // TODO: Upravte na URL vašeho repozitáře
    const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/VASEJMENO/VASREPO/main/docs/';
    
    // Seznam stránek pro navigaci
    const PAGES = [
        { file: 'intro.md', title: 'Úvod' },
        { file: 'getting-started.md', title: 'Začínáme' },
        { file: 'api.md', title: 'API Reference' },
    ];
    
    // --- SELEKTORY ELEMENTŮ ---
    const contentEl = document.getElementById('content');
    const navlistEl = document.getElementById('navlist');
    const themeToggle = document.getElementById('theme-toggle');
    const openMenuBtn = document.getElementById('open-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const overlayEl = document.getElementById('overlay');
    const sidebarEl = document.getElementById('sidebar');

    
    /**
     * Inicializuje celou aplikaci
     */
    function initApp() {
        createNav();
        setupTheme();
        setupMobileMenu();
        handleInitialLoad();
        
        // Poslouchá změny v historii (tlačítka Zpět/Vpřed)
        window.addEventListener('popstate', handlePopState);
    }

    // --- 1. NAČÍTÁNÍ A NAVIGACE ---

    /**
     * Vytvoří navigační odkazy v postranním panelu
     */
    function createNav() {
        navlistEl.innerHTML = ''; // Vyčistí případný placeholder
        PAGES.forEach(page => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${page.file}`;
            a.textContent = page.title;
            a.dataset.file = page.file;
            
            a.addEventListener('click', (e) => {
                e.preventDefault();
                const file = e.target.dataset.file;
                
                // Aktualizuje URL bez znovunačtení stránky
                history.pushState({ file: file }, '', `#${file}`);
                
                loadPage(file);
                closeSidebarIfMobile();
            });
            
            li.appendChild(a);
            navlistEl.appendChild(li);
        });
    }

    /**
     * Načte a zobrazí obsah stránky z Markdown souboru
     * @param {string} file - Název souboru (např. 'intro.md')
     */
    async function loadPage(file) {
        if (!file) return;

        contentEl.innerHTML = '<p>Načítání...</p>';
        
        try {
            const rawMarkdown = await fetchMarkdown(file);
            // Parsování Markdownu na HTML pomocí knihovny Marked.js
            const html = marked.parse(rawMarkdown);
            contentEl.innerHTML = html;
            
            // Aktualizace titulku stránky
            const pageTitle = PAGES.find(p => p.file === file)?.title || 'Dokumentace';
            document.title = `GOD | ${pageTitle}`;
            
            setActiveLink(file);
            window.scrollTo(0, 0); // Posun na začátek stránky
            
        } catch (error) {
            console.error('Chyba při načítání stránky:', error);
            contentEl.innerHTML = `<p class="text-red-500">Došlo k chybě při načítání obsahu. Zkuste to prosím znovu.</p><p>Chyba: ${error.message}</p>`;
        }
    }

    /**
     * Získá Markdown obsah (nejprve z GitHubu, pak lokálně)
     * @param {string} file - Název souboru
     */
    async function fetchMarkdown(file) {
        const githubUrl = `${GITHUB_RAW_BASE}${file}`;
        const localUrl = `docs/${file}`;
        
        try {
            // 1. Pokus o načtení ze vzdáleného repozitáře
            let response = await fetch(githubUrl);
            
            // 2. Pokud selže (např. 404), zkusí lokální fallback
            if (!response.ok) {
                console.warn(`Nepodařilo se načíst z GitHubu (${response.status}), zkouším lokální soubor.`);
                response = await fetch(localUrl);
            }
            
            // 3. Pokud selže i lokální, vyhodí chybu
            if (!response.ok) {
                throw new Error(`Soubor '${file}' nebyl nalezen ani na GitHubu, ani lokálně (status: ${response.status}).`);
            }
            
            return await response.text();
            
        } catch (error) {
            // Zachytí síťové chyby (např. CORS nebo offline)
            console.error('Fetch selhal:', error);
            throw new Error(`Síťová chyba při pokusu o načtení ${file}.`);
        }
    }

    /**
     * Zvýrazní aktivní odkaz v navigaci
     * @param {string} file - Název aktivního souboru
     */
    function setActiveLink(file) {
        navlistEl.querySelectorAll('a').forEach(a => {
            a.classList.toggle('active', a.dataset.file === file);
        });
    }

    /**
     * Zpracuje počáteční načtení stránky (podle URL hashe)
     */
    function handleInitialLoad() {
        const hash = window.location.hash.substring(1);
        const fileToLoad = hash || PAGES[0]?.file; // Načte první stránku, pokud není hash
        
        if (fileToLoad) {
            loadPage(fileToLoad);
            // Zajistí, že i první načtení má správný stav v historii
            history.replaceState({ file: fileToLoad }, '', `#${fileToLoad}`);
        }
    }

    /**
     * Zpracuje událost popstate (kliknutí na Zpět/Vpřed)
     */
    function handlePopState(event) {
        if (event.state && event.state.file) {
            loadPage(event.state.file);
        }
    }

    // --- 2. SPRÁVA STAVU A UI ---

    /**
     * Nastaví přepínání světlého/tmavého motivu
     */
    function setupTheme() {
        const localTheme = localStorage.getItem('GOD-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        let isDark = localTheme ? localTheme === 'dark' : prefersDark;
        
        applyTheme(isDark);

        themeToggle.addEventListener('click', () => {
            isDark = !document.body.classList.contains('dark');
            applyTheme(isDark);
        });
    }

    /**
     * Aplikuje daný motiv (dark/light)
     * @param {boolean} isDark - Zda má být motiv tmavý
     */
    function applyTheme(isDark) {
        document.body.classList.toggle('dark', isDark);
        themeToggle.setAttribute('aria-pressed', isDark);
        localStorage.setItem('GOD-theme', isDark ? 'dark' : 'light');
    }

    /**
     * Nastaví funkčnost mobilního menu (otevírání/zavírání)
     */
    function setupMobileMenu() {
        openMenuBtn.addEventListener('click', openSidebar);
        closeMenuBtn.addEventListener('click', closeSidebar);
        overlayEl.addEventListener('click', closeSidebar);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebarEl.classList.contains('open')) {
                closeSidebar();
            }
        });
    }

    function openSidebar() {
        sidebarEl.classList.add('open');
        overlayEl.classList.remove('hidden'); // Použijeme .hidden třídu z style.css
    }

    function closeSidebar() {
        sidebarEl.classList.remove('open');
        overlayEl.classList.add('hidden');
    }

    /**
     * Zavře postranní panel, pokud je na mobilním zobrazení
     */
    function closeSidebarIfMobile() {
        if (window.innerWidth < 1024) {
            closeSidebar();
        }
    }

    // --- SPUŠTĚNÍ APLIKACE ---
    initApp();
});
