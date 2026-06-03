import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getCategories, getProducts } from '../../services/catalogService';
import { usePriceContext } from '../../../../context/PriceContext';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { slugify } from '../../../../utils/slugify';
import styles from './CatalogPage.module.css';

export function CatalogPage() {
    const { slug, childSlug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const { priceListId } = usePriceContext();

    const q = searchParams.get('q') ?? '';
    const sort = searchParams.get('sort') ?? '';
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));

    const [products, setProducts] = useState([]);
    const [topCategories, setTopCategories] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        getCategories().then(setTopCategories).catch(() => { });
    }, []);

    useEffect(() => {
        document.title = (childCategory?.name ?? parentCategory?.name) ?? 'Conco y Punto'
    }, [window.location.pathname, topCategories]);

    const parentCategory = topCategories.find(c => (c.slug ?? slugify(c.name)) === slug) ?? null;
    const childCategory = childSlug && parentCategory
        ? (parentCategory.children ?? []).find(c => (c.slug ?? slugify(c.name)) === childSlug) ?? null
        : null;

    const activeCategory = childCategory ?? parentCategory;
    const categoryId = activeCategory?.id ?? null;
    const chipCategories = parentCategory?.children ?? [];

    useEffect(() => {
        const sortParams = sort === 'price_asc'
            ? { sort_by: 'price', sort_order: 'asc' }
            : sort === 'price_desc'
                ? { sort_by: 'price', sort_order: 'desc' }
                : {};
        setLoading(true);
        setFetchError(false);
        getProducts({ search: q, category_id: categoryId, page, per_page: 20, stock_min: 1, price_list_id: priceListId, ...sortParams })
            .then(data => { setProducts(data.data ?? []); setMeta(data); })
            .catch(() => { setFetchError(true); setProducts([]); })
            .finally(() => setLoading(false));
    }, [q, categoryId, sort, page, retryKey, priceListId]);

    const handleSort = (value) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (value) next.set('sort', value); else next.delete('sort');
            next.delete('page');
            return next;
        }, { replace: true });
    };

    const handlePage = (newPage) => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        })

        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (newPage > 1) next.set('page', String(newPage)); else next.delete('page');
            return next;
        }, { replace: true });
    };

    const clearSearch = () => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.delete('q');
            next.delete('page');
            return next;
        }, { replace: true });
    };

    return (
        <div className={styles.page}>
            {slug && activeCategory ? (
                <div className={styles.category_header}>
                    <nav className={styles.breadcrumb}>
                        <Link to="/" className={styles.bc_link}>Catálogo</Link>
                        <span className={styles.bc_sep}>›</span>
                        <Link to={`/categoria/${slug}`} className={styles.bc_link}>
                            {parentCategory.name}
                        </Link>
                        {childCategory && (
                            <>
                                <span className={styles.bc_sep}>›</span>
                                <span>{childCategory.name}</span>
                            </>
                        )}
                    </nav>
                    <h2 className={styles.category_title}>{activeCategory.name}</h2>
                </div>
            ) : null}

            {slug && chipCategories.length > 0 && (
                <div className={styles.filters_bar}>
                    {chipCategories.length > 0 && (
                        <div className={styles.child_chips}>
                            <Link
                                to={`/categoria/${slug}`}
                                className={`${styles.child_chip} ${!childSlug ? styles.child_chip_active : ''}`}
                            >
                                Todos
                            </Link>
                            {chipCategories.map(child => {
                                const cSlug = child.slug ?? slugify(child.name);
                                return (
                                    <Link
                                        key={child.id}
                                        to={`/categoria/${slug}/${cSlug}`}
                                        className={`${styles.child_chip} ${childSlug === cSlug ? styles.child_chip_active : ''}`}
                                    >
                                        {child.name}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                    <div className={styles.sort_group}>
                        <span className={styles.sort_label}>Precio</span>
                        <button
                            className={`${styles.sort_btn} ${sort === 'price_asc' ? styles.sort_btn_active : ''}`}
                            onClick={() => handleSort(sort === 'price_asc' ? '' : 'price_asc')}
                        >
                            ↑ Menor
                        </button>
                        <button
                            className={`${styles.sort_btn} ${sort === 'price_desc' ? styles.sort_btn_active : ''}`}
                            onClick={() => handleSort(sort === 'price_desc' ? '' : 'price_desc')}
                        >
                            ↓ Mayor
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className={styles.grid} aria-busy="true">
                    {Array.from({ length: 8 }, (_, i) => (
                        <div key={i} className={styles.skel_card} aria-hidden="true">
                            <div className={`${styles.skel} ${styles.skel_img_area}`} />
                            <div className={styles.skel_body}>
                                <div className={styles.skel} style={{ height: 13, width: '78%' }} />
                                <div className={styles.skel} style={{ height: 13, width: '52%' }} />
                                <div className={styles.skel} style={{ height: 21, width: '38%', marginTop: 6 }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : fetchError ? (
                <div className={styles.error_state}>
                    <p className={styles.error_msg}>No pudimos cargar los productos.</p>
                    <p className={styles.error_sub}>Verificá tu conexión e intentá de nuevo.</p>
                    <button className={styles.retry_btn} onClick={() => setRetryKey(k => k + 1)}>
                        Reintentar
                    </button>
                </div>
            ) : products.length === 0 ? (
                <div className={styles.empty_state} role="status">
                    {q ? (
                        <>
                            <p className={styles.empty_title}>Sin resultados para "{q}"</p>
                            {activeCategory && <p className={styles.empty_sub}>en {activeCategory.name}</p>}
                            <div className={styles.empty_actions}>
                                <button className={styles.empty_action_btn} onClick={clearSearch}>
                                    Limpiar búsqueda
                                </button>
                                <Link to="/" className={styles.empty_action_link}>Ver todo el catálogo</Link>
                            </div>
                        </>
                    ) : activeCategory ? (
                        <>
                            <p className={styles.empty_title}>Sin productos en {activeCategory.name}</p>
                            <p className={styles.empty_sub}>Todavía no hay productos en esta categoría.</p>
                            <div className={styles.empty_actions}>
                                {childCategory && parentCategory && (
                                    <Link to={`/categoria/${slug}`} className={styles.empty_action_btn}>
                                        Ver todo en {parentCategory.name}
                                    </Link>
                                )}
                                <Link to="/" className={styles.empty_action_link}>Explorar catálogo</Link>
                            </div>
                        </>
                    ) : (
                        <p className={styles.empty_title}>Sin productos disponibles.</p>
                    )}
                </div>
            ) : (
                <div className={styles.grid}>
                    {products.flatMap(p => {
                        const allVariants = p.variants ?? [];
                        const inStockVariants = allVariants.filter(v => v.is_active !== false && v.stock > 0);

                        if (q) {
                            const term = q.toLowerCase();

                            const matchingInStock = inStockVariants.filter(v =>
                                v.sku?.toLowerCase().includes(term) ||
                                (v.attribute_values ?? []).some(av => av.value?.toLowerCase().includes(term))
                            );
                            if (matchingInStock.length > 0) {
                                return matchingInStock.map(v => <ProductCard key={`v-${v.id}`} product={p} variant={v} />);
                            }

                            const outOfStockMatches = allVariants.some(v =>
                                v.sku?.toLowerCase().includes(term) ||
                                (v.attribute_values ?? []).some(av => av.value?.toLowerCase().includes(term))
                            );
                            if (outOfStockMatches) return [];

                            const productAttrMatches = (p.attribute_values ?? []).some(av =>
                                av.value?.toLowerCase().includes(term)
                            );
                            if (productAttrMatches) {
                                return p.stock > 0 ? [<ProductCard key={`p-${p.id}`} product={p} />] : [];
                            }
                        }

                        const variantsToShow = inStockVariants;
                        const showBase = p.stock > 0 || variantsToShow.length === 0;

                        if (variantsToShow.length === 0) {
                            return showBase ? [<ProductCard key={`p-${p.id}`} product={p} />] : [];
                        }
                        return [
                            ...(showBase ? [<ProductCard key={`p-${p.id}`} product={p} />] : []),
                            ...variantsToShow.map(v => <ProductCard key={`v-${v.id}`} product={p} variant={v} />),
                        ];
                    })}
                </div>
            )}

            {meta && meta.last_page > 1 && (
                <nav className={styles.pagination}>
                    <button
                        className={styles.page_btn}
                        onClick={() => handlePage(page - 1)}
                        disabled={page === 1}
                    >
                        ← Anterior
                    </button>
                    <span className={styles.page_info}>{page} / {meta.last_page}</span>
                    <button
                        className={styles.page_btn}
                        onClick={() => handlePage(page + 1)}
                        disabled={page === meta.last_page}
                    >
                        Siguiente →
                    </button>
                </nav>
            )}
        </div>
    );
}
