import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../../services/catalogService';
import { usePriceContext } from '../../../../context/PriceContext';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { absoluteUrl } from '../../../../config/api';
import { Seo } from '../../../../components/Seo/Seo';
import styles from '../CatalogPage/CatalogPage.module.css';

export function StockEntriesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { priceListId } = usePriceContext();

    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));

    const [products, setProducts] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        setLoading(true);
        setFetchError(false);
        getProducts({ sort_by: 'stock_entry', sort_order: 'desc', stock_min: 1, price_list_id: priceListId, page, per_page: 20 })
            .then(data => { setProducts(data.data ?? []); setMeta(data); })
            .catch(() => { setFetchError(true); setProducts([]); })
            .finally(() => setLoading(false));
    }, [page, retryKey, priceListId]);

    const handlePage = (newPage) => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (newPage > 1) next.set('page', String(newPage)); else next.delete('page');
            return next;
        }, { replace: true });
    };

    return (
        <div className={styles.page}>
            <Seo
                title="Ingresos"
                description="Últimos ingresos de productos en Conco y Punto."
                canonical={absoluteUrl('/ingresos')}
            />
            <div className={styles.category_header}>
                <h1 className={styles.category_title}>Ingresos</h1>
            </div>

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
                    <p className={styles.empty_title}>Sin productos disponibles.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {products.flatMap(p => {
                        const variants = (p.variants ?? []).filter(v => v.is_active !== false && v.stock > 0);
                        if (variants.length > 0) {
                            return [
                                ...(p.stock > 0 ? [<ProductCard key={`p-${p.id}`} product={p} />] : []),
                                ...variants.map(v => <ProductCard key={`v-${v.id}`} product={p} variant={v} />),
                            ];
                        }
                        return p.stock > 0 ? [<ProductCard key={`p-${p.id}`} product={p} />] : [];
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
