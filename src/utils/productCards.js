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

// ¿El producto satisface TODAS las palabras de la búsqueda? Busca cada palabra en
// nombre + sku + atributos del base y de las variantes. Sirve para distinguir un
// resultado real de una sugerencia: "gorro rojo" en un gorro sin rojo -> false.
// Palabras de 1 char: match de token exacto (talles "M"/"S"); ≥2 chars: substring.
// Sin query -> true.
export function productMatchesQuery(product, query) {
    const words = (query ?? '').toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return true;

    const parts = [
        product.name,
        product.sku,
        ...(product.attribute_values ?? []).map(a => a.value),
        ...(product.variants ?? []).flatMap(v => [
            v.sku,
            ...(v.attribute_values ?? []).map(a => a.value),
        ]),
    ].filter(Boolean);

    const hay = parts.join(' ').toLowerCase();
    const tokens = hay.split(/\s+/);

    return words.every(w => (w.length >= 2 ? hay.includes(w) : tokens.includes(w)));
}
