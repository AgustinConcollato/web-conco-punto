import { Link } from 'react-router-dom';
import { ProductGrid } from '../ProductGrid/ProductGrid';
import styles from './ProductsGridSection.module.css';

export function ProductsGridSection({ title, products, viewAllHref, keyword }) {
    if (!products?.length) return null;

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>{title}</h2>
                {viewAllHref && (
                    <Link to={viewAllHref} className={styles.view_all}>Ver todo →</Link>
                )}
            </div>
            <ProductGrid products={products} keyword={keyword} />
        </section>
    );
}
