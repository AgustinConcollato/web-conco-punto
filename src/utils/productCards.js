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
    const allVariants = product.variants ?? [];
    const inStockVariants = allVariants.filter(v => v.is_active !== false && v.stock > 0);

    const matches = (v) =>
        v.sku?.toLowerCase().includes(term) ||
        (v.attribute_values ?? []).some(av => av.value?.toLowerCase().includes(term));

    const matchingInStock = inStockVariants.filter(matches);
    if (matchingInStock.length > 0) {
        return matchingInStock.map(v => ({ key: `v-${v.id}`, variant: v }));
    }

    // La variante que matchea está sin stock: no mostrar nada de este producto.
    if (allVariants.some(matches)) return [];

    // Matchea un atributo del producto base (no de una variante).
    const productAttrMatches = (product.attribute_values ?? []).some(av =>
        av.value?.toLowerCase().includes(term)
    );
    if (productAttrMatches) {
        return product.stock > 0 ? [{ key: `p-${product.id}` }] : [];
    }

    // El producto matcheó por nombre/descripción (búsqueda backend): usar default.
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
