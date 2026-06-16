import { Link } from 'react-router-dom';
import { ProductCard } from '../../../catalog/components/ProductCard/ProductCard';
import { HorizontalScroller } from '../../../../components/HorizontalScroller/HorizontalScroller';
import { queryMatchCards } from '../../../../utils/productCards';
import styles from './ProductsSection.module.css';

export function ProductsSection({ title, products, viewAllHref, keyword }) {
    if (!products?.length) return null;

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>{title}</h2>
                {viewAllHref && (
                    <Link to={viewAllHref} className={styles.view_all}>Ver todo →</Link>
                )}
            </div>
            <HorizontalScroller className={styles.row}>
                {products.flatMap(p => {
                    // Sección por keyword: filtrar variantes igual que /buscar.
                    const matched = queryMatchCards(p, keyword);
                    if (matched !== null) {
                        return matched.map(c => (
                            <div key={c.key} className={styles.card_wrap}>
                                <ProductCard product={p} variant={c.variant} />
                            </div>
                        ));
                    }

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
        </section>
    );
}
