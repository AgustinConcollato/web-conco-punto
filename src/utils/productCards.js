// Selección de cards de un producto según un término de búsqueda (query/keyword).
//
// Devuelve descriptores `{ key, variant? }` para renderizar como ProductCard, o
// `null` cuando no hay query o el producto no matchea por variante/atributo (en ese
// caso el caller debe aplicar su comportamiento por defecto).
//
// Usado por la página de búsqueda (CatalogPage) y por las secciones del home con
// `source: 'keyword'` para que ambas filtren las variantes igual.
export function queryMatchCards(product, query) {
    if (!query) return null;

    const term = query.toLowerCase();
    const words = term.split(/\s+/).filter(Boolean);
    const allVariants = product.variants ?? [];
    const inStockVariants = allVariants.filter(v => v.is_active !== false && v.stock > 0);

    // Una variante matchea si ALGUNA palabra de la búsqueda coincide con su sku o
    // alguno de sus atributos. Así "gorro rojo" filtra a la variante "Rojo" (por la
    // palabra "rojo"), en vez de comparar la frase entera y no matchear ninguna.
    // Match exacto para palabras cortas (talles: "M", "S"), substring desde 2 chars
    // (colores, "xl"), para evitar ruido tipo "m" dentro de "amarillo".
    const matches = (v) => {
        const sku = v.sku?.toLowerCase() ?? '';
        const attrs = (v.attribute_values ?? []).map(av => av.value?.toLowerCase() ?? '');
        return words.some(w => {
            if (attrs.some(a => a === w)) return true;
            if (w.length < 2) return false;
            return sku.includes(w) || attrs.some(a => a.includes(w));
        });
    };

    const matchingInStock = inStockVariants.filter(matches);
    if (matchingInStock.length > 0) {
        return matchingInStock.map(v => ({ key: `v-${v.id}`, variant: v }));
    }

    // La variante que matchea está sin stock: no mostrar nada de este producto.
    if (allVariants.some(matches)) return [];

    // No matcheó ninguna variante: el producto vino por nombre/descripción o por un
    // atributo general del base (que las variantes comparten, ej. "Gorro"). En todos
    // esos casos mostramos el set por defecto (base con stock + variantes con stock),
    // sin colapsar al producto base ni ocultar las variantes.
    return null;
}

// Default sin query: base (si tiene stock o no hay variantes) + variantes con stock.
export function defaultCards(product) {
    const inStockVariants = (product.variants ?? []).filter(v => v.is_active !== false && v.stock > 0);
    const showBase = product.stock > 0 || inStockVariants.length === 0;

    return [
        ...(showBase ? [{ key: `p-${product.id}` }] : []),
        ...inStockVariants.map(v => ({ key: `v-${v.id}`, variant: v })),
    ];
}

// Punto de entrada único: filtra por query si hay, si no aplica el default.
export function productCards(product, query) {
    return queryMatchCards(product, query) ?? defaultCards(product);
}

// Cards (base/variantes) CON STOCK que satisfacen TODAS las palabras de la búsqueda.
// Cada card matchea si el texto del producto (nombre + atributos de producto) más los atributos
// propios de esa card contienen todas las palabras. Clave para no mostrar, p. ej., la variante
// Azul cuando se busca "gorro negro" y el negro está sin stock.
//
// Distinción importante: los atributos del base que corresponden a un EJE de variante (Color,
// Talle: los category_attribute que usan las variantes) son ruido (el "color del base") y se
// ignoran para matchear. El resto de atributos del base (Marca, Material, Tipo) sí cuentan a
// nivel producto, así una búsqueda por marca sigue trayendo los productos con variantes.
export function searchCards(product, query) {
    // Normaliza: minúsculas + sin acentos, para que "camion" matchee "camión".
    const norm = (s) => (s ?? '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const words = norm(query).split(/\s+/).filter(Boolean);
    if (!words.length) return defaultCards(product);

    const allVariants = product.variants ?? [];
    const inStockVariants = allVariants.filter(v => v.is_active !== false && v.stock > 0);

    // Ejes de variante = category_attribute usados por las variantes (ej. Color).
    const axisIds = new Set();
    for (const v of allVariants) {
        for (const a of (v.attribute_values ?? [])) {
            if (a.category_attribute_id != null) axisIds.add(a.category_attribute_id);
        }
    }

    // Atributos del base que NO son eje de variante -> matchean a nivel producto.
    const baseProductValues = (product.attribute_values ?? [])
        .filter(a => !axisIds.has(a.category_attribute_id))
        .map(a => a.value ?? '')
        .join(' ');

    const productText = norm(`${product.name ?? ''} ${baseProductValues} ${product.sku ?? ''}`);

    const hasAll = (hay) => {
        const tokens = hay.split(/\s+/);
        return words.every(w => (w.length >= 2 ? hay.includes(w) : tokens.includes(w)));
    };

    const attrsText = (o) => (o.attribute_values ?? []).map(a => a.value ?? '').join(' ');
    const cards = [];

    // Card base: visible si el base tiene stock (o el producto no tiene variantes) y el texto
    // de producto satisface todas las palabras (sin considerar colores de variantes).
    const showBase = product.stock > 0 || inStockVariants.length === 0;
    if (showBase && hasAll(productText)) {
        cards.push({ key: `p-${product.id}` });
    }

    // Cards de variantes con stock: texto de producto + atributos de la variante.
    for (const v of inStockVariants) {
        if (hasAll(norm(`${productText} ${attrsText(v)} ${v.sku ?? ''}`))) {
            cards.push({ key: `v-${v.id}`, variant: v });
        }
    }

    return cards;
}
