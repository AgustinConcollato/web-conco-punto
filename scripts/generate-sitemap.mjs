// Genera public/sitemap.xml en el build, pegándole a la API pública.
// Best-effort: si la API falla, escribe igual el sitemap con las rutas estáticas.
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../public/sitemap.xml');

const SITE_URL = (process.env.VITE_SITE_URL ?? 'https://mayorista.concoypunto.com').replace(/\/$/, '');
const API_URL = (process.env.VITE_API_URL ?? 'https://api-v2.concoypunto.com/api').replace(/\/$/, '');

const STATIC_PATHS = ['/', '/buscar', '/ingresos'];

function slugify(str) {
    return String(str ?? '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

async function getJson(path) {
    const res = await fetch(`${API_URL}${path}`, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status} en ${path}`);
    return res.json();
}

async function collectUrls() {
    const urls = new Set(STATIC_PATHS);

    // Categorías
    try {
        const categories = await getJson('/categories');
        for (const c of categories ?? []) {
            const parentSlug = c.slug ?? slugify(c.name);
            urls.add(`/categoria/${parentSlug}`);
            for (const child of c.children ?? []) {
                const childSlug = child.slug ?? slugify(child.name);
                urls.add(`/categoria/${parentSlug}/${childSlug}`);
            }
        }
    } catch (e) {
        console.warn('[sitemap] categorías:', e.message);
    }

    // Productos (paginado)
    try {
        let page = 1;
        let lastPage = 1;
        do {
            const data = await getJson(`/catalog?per_page=100&stock_min=1&page=${page}`);
            for (const p of data.data ?? []) {
                const base = slugify(p.name);
                urls.add(`/productos/${base ? `${base}-${p.id}` : p.id}`);
            }
            lastPage = data.last_page ?? 1;
            page += 1;
        } while (page <= lastPage && page <= 200); // tope de seguridad
    } catch (e) {
        console.warn('[sitemap] productos:', e.message);
    }

    return [...urls];
}

function buildXml(paths) {
    const today = new Date().toISOString().slice(0, 10);
    const body = paths.map(p => `  <url><loc>${SITE_URL}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

(async () => {
    let paths = STATIC_PATHS;
    try {
        paths = await collectUrls();
    } catch (e) {
        console.warn('[sitemap] fallback a rutas estáticas:', e.message);
    }
    mkdirSync(dirname(OUT), { recursive: true });
    writeFileSync(OUT, buildXml(paths), 'utf8');
    console.log(`[sitemap] ${paths.length} URLs -> public/sitemap.xml`);
})();
