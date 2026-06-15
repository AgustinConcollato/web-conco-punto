import { slugify } from './slugify';

/**
 * Construye la URL de un producto con slug + id.
 * @param {{id: number|string, name?: string}} product
 * @param {{id: number|string}} [variant]
 * @returns {string} ej: /productos/zapatilla-roja-123
 */
export function productHref(product, variant) {
    if (!product?.id) return '/';
    const base = slugify(product.name ?? '');
    const slugId = base ? `${base}-${product.id}` : String(product.id);
    return variant
        ? `/productos/${slugId}/variante/${variant.id}`
        : `/productos/${slugId}`;
}

const UUID_RE = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

/**
 * Extrae el id del final de un slug. Los ids de producto son UUID
 * ("mini-muneca-019ea9e8-70c2-7128-b315-5a9cf0064c6d" -> el UUID).
 * Soporta también ids numéricos viejos y el id "pelado" sin slug.
 * @param {string} slugId
 * @returns {string|null}
 */
export function parseProductId(slugId) {
    const s = String(slugId ?? '');
    const uuid = s.match(UUID_RE);
    if (uuid) return uuid[1];
    const num = s.match(/(\d+)$/);
    if (num) return num[1];
    return s || null;
}
