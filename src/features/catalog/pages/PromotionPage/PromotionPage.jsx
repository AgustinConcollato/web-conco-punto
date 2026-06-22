import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPromotion } from '../../services/catalogService';
import { usePriceContext } from '../../../../context/PriceContext';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { productCards } from '../../../../utils/productCards';
import { promoEndDisplay } from '../../../../utils/promo';
import { Seo } from '../../../../components/Seo/Seo';
import styles from './PromotionPage.module.css';

function ClockIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </svg>
    );
}

export function PromotionPage() {
    const { id } = useParams();
    const { priceListId } = usePriceContext();
    const [promo, setPromo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        setLoading(true);
        setError(false);
        getPromotion(id, priceListId)
            .then(setPromo)
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [id, priceListId, retryKey]);

    const end = promo ? promoEndDisplay(promo) : null;

    return (
        <div className={styles.page}>
            <Seo
                title={promo?.name ?? 'Promoción'}
                description={promo?.description ?? undefined}
                noindex
            />

            <nav className={styles.breadcrumb}>
                <Link to="/" className={styles.bc_link}>Inicio</Link>
                <span className={styles.bc_sep}>›</span>
                <span>{promo?.name ?? 'Promoción'}</span>
            </nav>

            {!loading && promo && (
                <div className={styles.promo_header}>
                    <div className={styles.promo_meta}>
                        <h1 className={styles.promo_title}>{promo.name}</h1>
                        {promo.description && (
                            <p className={styles.promo_desc}>{promo.description}</p>
                        )}
                    </div>
                    {end && (
                        <span className={`${styles.promo_end} ${end.urgent ? styles.promo_end_urgent : ''}`}>
                            <ClockIcon /> {end.text}
                        </span>
                    )}
                </div>
            )}

            {loading ? (
                <div className={styles.grid} aria-busy="true">
                    {Array.from({ length: 8 }, (_, i) => (
                        <div key={i} className={styles.skel_card} aria-hidden="true">
                            <div className={`${styles.skel} ${styles.skel_img}`} />
                            <div className={styles.skel_body}>
                                <div className={styles.skel} style={{ height: 13, width: '78%' }} />
                                <div className={styles.skel} style={{ height: 13, width: '52%' }} />
                                <div className={styles.skel} style={{ height: 21, width: '38%', marginTop: 6 }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className={styles.state}>
                    <p>No pudimos cargar la promoción.</p>
                    <button className={styles.retry_btn} onClick={() => setRetryKey(k => k + 1)}>
                        Reintentar
                    </button>
                </div>
            ) : !promo || promo.products?.length === 0 ? (
                <div className={styles.state}>
                    <p>No hay productos disponibles en esta promoción.</p>
                    <Link to="/" className={styles.bc_link}>Volver al inicio</Link>
                </div>
            ) : (
                <div className={styles.grid}>
                    {promo.products.flatMap(p =>
                        productCards(p).map(c => (
                            <ProductCard key={c.key} product={p} variant={c.variant} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
