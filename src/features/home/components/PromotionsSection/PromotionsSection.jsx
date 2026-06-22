import { Link } from 'react-router-dom';
import { ProductCard } from '../../../catalog/components/ProductCard/ProductCard';
import { HorizontalScroller } from '../../../../components/HorizontalScroller/HorizontalScroller';
import { productCards } from '../../../../utils/productCards';
import { promoEndDisplay } from '../../../../utils/promo';
import styles from './PromotionsSection.module.css';

function ClockIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </svg>
    );
}

export function PromotionsSection({ promotions, title }) {
    if (!promotions?.length) return null;

    return (
        <section className={styles.section}>
            {promotions.map(promo => {
                const end = promoEndDisplay(promo);
                return (
                <div key={promo.id} className={styles.promo_block}>
                    <div className={styles.promo_header}>
                        <div className={styles.promo_title_row}>
                            <h2 className={styles.promo_title}>{title || promo.name}</h2>
                            <Link to={`/promocion/${promo.id}`} className={styles.promo_see_all}>
                                Ver todos →
                            </Link>
                        </div>
                        {promo.description && (
                            <p className={styles.promo_desc}>{promo.description}</p>
                        )}
                        {end && (
                            <span className={`${styles.promo_end} ${end.urgent ? styles.promo_end_urgent : ''}`}>
                                <ClockIcon /> {end.text}
                            </span>
                        )}
                    </div>

                    {promo.products?.length > 0 && (
                        <HorizontalScroller className={styles.grid}>
                            {promo.products.flatMap(p =>
                                productCards(p).map(c => (
                                    <div key={c.key} className={styles.card_wrap}>
                                        <ProductCard product={p} variant={c.variant} />
                                    </div>
                                ))
                            )}
                        </HorizontalScroller>
                    )}
                </div>
                );
            })}
        </section>
    );
}
