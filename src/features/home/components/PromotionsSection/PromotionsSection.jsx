import { ProductCard } from '../../../catalog/components/ProductCard/ProductCard';
import { HorizontalScroller } from '../../../../components/HorizontalScroller/HorizontalScroller';
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

export function PromotionsSection({ promotions }) {
    if (!promotions?.length) return null;

    return (
        <section className={styles.section}>
            {promotions.map(promo => {
                const end = promoEndDisplay(promo);
                return (
                <div key={promo.id} className={styles.promo_block}>
                    <div className={styles.promo_header}>
                        <h2 className={styles.promo_title}>{promo.name}</h2>
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
                            {promo.products.flatMap(p => {
                                const variants = (p.variants ?? []).filter(v => v.is_active !== false && v.stock > 0);
                                if (variants.length > 0) {
                                    return variants.map(v => (
                                        <div key={`v-${v.id}`} className={styles.card_wrap}>
                                            <ProductCard product={p} variant={v} />
                                        </div>
                                    ));
                                }
                                return [
                                    <div key={`p-${p.id}`} className={styles.card_wrap}>
                                        <ProductCard product={p} />
                                    </div>
                                ];
                            })}
                        </HorizontalScroller>
                    )}
                </div>
                );
            })}
        </section>
    );
}
