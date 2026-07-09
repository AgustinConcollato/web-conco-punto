import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getCategories, getProducts } from '../../services/catalogService';
import { usePriceContext } from '../../../../context/PriceContext';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { productCards, defaultCards, productMatchesQuery } from '../../../../utils/productCards';
import { slugify } from '../../../../utils/slugify';
import { absoluteUrl } from '../../../../config/api';
import { Seo } from '../../../../components/Seo/Seo';
import { JsonLd } from '../../../../components/Seo/JsonLd';
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

    const parentCategory = topCategories.find(c => (c.slug ?? slugify(c.name)) === slug) ?? null;
    const childCategory = childSlug && parentCategory
        ? (parentCategory.children ?? []).find(c => (c.slug ?? slugify(c.name)) === childSlug) ?? null
        : null;

    const activeCategory = childCategory ?? parentCategory;
    const categoryId = activeCategory?.id ?? null;
    const chipCategories = parentCategory?.children ?? [];

    // --- SEO ---
    const isCategoryPage = Boolean(slug && activeCategory);
    const seoNoindex = !isCategoryPage || Boolean(q);  // /buscar y búsquedas con query no se indexan
    const categoryPath = childCategory
        ? `/categoria/${slug}/${childSlug}`
        : `/categoria/${slug}`;
    const seoCanonical = isCategoryPage ? absoluteUrl(categoryPath) : absoluteUrl('/buscar');
    const seoTitle = isCategoryPage ? activeCategory.name : 'Buscar productos';
    const seoDescription = isCategoryPage
        ? `Comprá ${activeCategory.name} en Conco y Punto. Catálogo con precios y stock actualizados.`
        : 'Buscá en el catálogo de Conco y Punto.';

    const breadcrumbLd = isCategoryPage ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Inicio', item: absoluteUrl('/') },
            ...(childCategory
                ? [
                    { '@type': 'ListItem', position: 2, name: parentCategory.name, item: absoluteUrl(`/categoria/${slug}`) },
                    { '@type': 'ListItem', position: 3, name: childCategory.name, item: absoluteUrl(categoryPath) },
                ]
                : [{ '@type': 'ListItem', position: 2, name: activeCategory.name, item: absoluteUrl(categoryPath) }]),
        ],
    } : null;

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

    // Resultados reales: con búsqueda, solo los productos que satisfacen TODAS las palabras
    // y que aportan al menos una card con stock. (El backend ya filtra con AND, pero además
    // acá descartamos, p. ej., un "gorro rojo" cuyo único rojo está sin stock.)
    const { cards, hasRealResults } = useMemo(() => {
        const build = (prods) => prods.flatMap(p => productCards(p, q).map(cd => ({ p, c: cd })));
        const source = q ? products.filter(p => productMatchesQuery(p, q)) : products;
        const list = build(source);
        return { cards: list, hasRealResults: list.length > 0 };
    }, [products, q]);

    // Si la búsqueda estricta no dio resultados con stock, buscamos sugerencias relajando la
    // query: sacamos la última palabra ("gorro rojo" -> "gorro"). Solo para queries multi-palabra.
    const [suggestions, setSuggestions] = useState([]);
    useEffect(() => {
        const words = q.trim().split(/\s+/).filter(Boolean);
        if (loading || fetchError || hasRealResults || words.length < 2) {
            setSuggestions([]);
            return;
        }
        const relaxed = words.slice(0, -1).join(' ');
        let active = true;
        getProducts({ search: relaxed, category_id: categoryId, per_page: 12, stock_min: 1, price_list_id: priceListId })
            .then(d => { if (active) setSuggestions(d.data ?? []); })
            .catch(() => { if (active) setSuggestions([]); });
        return () => { active = false; };
    }, [q, hasRealResults, loading, fetchError, categoryId, priceListId]);

    const suggestionCards = suggestions.flatMap(p => defaultCards(p).map(cd => ({ p, c: cd })));

    return (
        <div className={styles.page}>
            <Seo
                title={seoTitle}
                description={seoDescription}
                canonical={seoCanonical}
                noindex={seoNoindex}
            />
            {breadcrumbLd && <JsonLd data={breadcrumbLd} />}
            {slug && activeCategory ? (
                <div className={styles.category_header}>
                    <nav className={styles.breadcrumb}>
                        <Link to="/" className={styles.bc_link}>Inicio</Link>
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
                    <h1 className={styles.category_title}>{activeCategory.name}</h1>
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
            ) : hasRealResults ? (
                <div className={styles.grid}>
                    {cards.map(({ p, c }) => (
                        <ProductCard key={c.key} product={p} variant={c.variant} />
                    ))}
                </div>
            ) : suggestionCards.length > 0 ? (
                <>
                    <div className={styles.suggest_notice}>
                        <p className={styles.suggest_title}>Sin resultados para "{q}"</p>
                        <p className={styles.suggest_sub}>Quizás te interese:</p>
                    </div>
                    <div className={styles.grid}>
                        {suggestionCards.map(({ p, c }) => (
                            <ProductCard key={c.key} product={p} variant={c.variant} />
                        ))}
                    </div>
                </>
            ) : (
                <div className={styles.empty_state} role="status">
                    {q ? (
                        <>
                            <p className={styles.empty_title}>Sin resultados para "{q}"</p>
                            {activeCategory && <p className={styles.empty_sub}>en {activeCategory.name}</p>}
                            <div className={styles.empty_actions}>
                                <button className={styles.empty_action_btn} onClick={clearSearch}>
                                    Limpiar búsqueda
                                </button>
                                <Link to="/buscar" className={styles.empty_action_link}>Ver todo el catálogo</Link>
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
                                <Link to="/buscar" className={styles.empty_action_link}>Explorar catálogo</Link>
                            </div>
                        </>
                    ) : (
                        <p className={styles.empty_title}>Sin productos disponibles.</p>
                    )}
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
