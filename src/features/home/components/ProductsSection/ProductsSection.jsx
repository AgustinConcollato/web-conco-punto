import { Link } from 'react-router-dom';
import { ProductCard } from '../../../catalog/components/ProductCard/ProductCard';
import { HorizontalScroller } from '../../../../components/HorizontalScroller/HorizontalScroller';
import { productCards } from '../../../../utils/productCards';
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
                {products.flatMap(p =>
                    // Sección por keyword: filtra variantes igual que /buscar.
                    // Sin keyword: base + variantes con stock (igual que catálogo/ingresos).
                    productCards(p, keyword).map(c => (
                        <div key={c.key} className={styles.card_wrap}>
                            <ProductCard product={p} variant={c.variant} />
                        </div>
                    ))
                )}
            </HorizontalScroller>
        </section>
    );
}
