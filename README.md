Detailní popis funkce aplikace
Tato aplikace je lehká, moderní webová stránka sloužící jako prezentační a dokumentační web. Je postavena jako jednostránková aplikace (SPA - Single-Page Application), což znamená, že se stránka nikdy plně nenačítá znovu. Místo toho se obsah dynamicky mění přímo v prohlížeči.
Zde je podrobný rozpis její funkčnosti:
1. Načítání a Vykreslování Obsahu
Hlavní funkcí aplikace je zobrazovat dokumentaci.
Zdroj Obsahu: Obsah stránek (jako 'Úvod', 'Instalace' atd.) není napsán přímo v HTML. Místo toho je uložen jako samostatné soubory ve formátu Markdown (.md).
Dynamické Načítání: Když uživatel klikne na odkaz v navigaci, JavaScript (main.js) převezme kontrolu.
Funkce fetchMarkdown(file) se pokusí stáhnout příslušný .md soubor z externího zdroje – konkrétně z GitHub repozitáře (https://raw.githubusercontent.com/RuzickaHub/UDF/main/docs/).
Záložní (Fallback) Mechanismus: Pokud se stažení z GitHubu nepodaří (např. repozitář není veřejný nebo chybí připojení), skript se pokusí načíst soubor z lokální složky /docs/ na serveru.
Vykreslování: Po úspěšném stažení Markdown textu použije aplikace externí knihovnu marked.js (importovanou v index.html). Tato knihovna převede Markdown text na HTML kód.
Vložení do Stránky: Výsledné HTML je vloženo do hlavního obsahového prvku <main id="content">. Tím se obsah stránky změní bez nutnosti nového načtení.
2. Navigace (SPA)
Aplikace se chová jako jednostránková aplikace díky správě historie prohlížeče.
Generování Navigace: Navigační menu v postranním panelu (<aside id="sidebar">) se negeneruje ručně v HTML, ale dynamicky pomocí JavaScriptu. Funkce createNav() přečte pole PAGES v main.js a vytvoří odkazy pro každou definovanou stránku.
Zpracování Kliknutí: Když uživatel klikne na navigační odkaz:
JavaScript (main.js) zabrání výchozí akci prohlížeče (plnému načtení stránky).
Spustí funkci loadPage(), která načte a vykreslí nový obsah (viz bod 1).
Pomocí history.pushState() změní URL v adresním řádku (přidá "hash", např. #usage.md). To umožňuje sdílení odkazů na konkrétní sekce.
Tlačítka Zpět/Vpřed: Aplikace naslouchá události popstate (stisknutí tlačítek zpět/vpřed v prohlížeči). Když k tomu dojde, přečte "hash" z URL a zavolá loadPage(), aby se zobrazil správný historický obsah.
Aktivní Odkaz: Skript (setActiveLink) vizuálně zvýrazní aktuálně zobrazenou stránku v navigačním menu (přidáním třídy .active).
3. Klíčové Funkce a Uživatelské Rozhraní
Aplikace obsahuje dvě hlavní moderní funkce pro vylepšení uživatelského zážitku.
A. Přepínání Vzhledu (Světlý/Tmavý Režim)
Detekce a Ukládání: Funkce setupTheme() při startu kontroluje:
Zda má uživatel uloženo preferenci v localStorage (pod klíčem udf-theme).
Pokud ne, detekuje preferenci operačního systému (prefers-color-scheme: dark).
Funkce Tlačítka: Tlačítko id="theme-toggle" (ikona měsíce/slunce) má posluchač událostí.
Přepínání: Při kliknutí se přepne (toggle) třída .dark na prvku <body>. Soubor style.css pak aplikuje odlišné barevné schéma definované v proměnných CSS.
Perzistence: Volba uživatele (světlá/tmavá) se okamžitě uloží do localStorage, takže si ji prohlížeč pamatuje i při příští návštěvě.
B. Responzivní Design (Mobilní Menu)
Aplikace je plně responzivní a přizpůsobuje se různým velikostem obrazovky.
Desktop: Na obrazovkách širších než 1024px (style.css) je postranní panel (#sidebar) trvale viditelný vlevo vedle obsahu.
Mobil/Tablet: Na obrazovkách užších než 1024px:
Postranní panel je skrytý mimo obrazovku (transform: translateX(-110%)).
Zobrazí se "hamburger" tlačítko (#mobile-menu-open) v záhlaví.
Otevření Menu: Kliknutí na "hamburger" (setupMobileMenu()) přidá třídu .open na #sidebar, čímž se menu vysune. Zároveň se zobrazí tmavé překrytí (#overlay) pod menu a zablokuje se scrollování stránky.
Zavření Menu: Menu lze zavřít několika způsoby:
Kliknutím na tlačítko "Zavřít" (#mobile-menu-close) v menu.
Kliknutím na tmavé překrytí (#overlay).
Stisknutím klávesy Escape.
Automaticky po kliknutí na jakýkoliv navigační odkaz (aby uživatel viděl obsah, na který klikl).
4. Inicializace Aplikace
Celý proces se spouští, jakmile je struktura stránky (DOM) připravena (DOMContentLoaded):
createNav(): Vytvoří navigační odkazy v postranním panelu.
setupTheme(): Nastaví správný světlý/tmavý režim.
setupMobileMenu(): Aktivuje posluchače pro mobilní menu (hamburger, overlay atd.).
loadPage(initial): Zjistí, zda je v URL nějaký "hash" (např. z odkazu). Pokud ano, načte tuto stránku. Pokud ne, načte výchozí stránku (první v poli PAGES, tj. intro.md).
                                  
