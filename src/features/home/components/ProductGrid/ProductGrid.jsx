import { ProductCard } from '../../../catalog/components/ProductCard/ProductCard';
import { productCards } from '../../../../utils/productCards';
import styles from './ProductGrid.module.css';

export function ProductGrid({ products, keyword }) {
    if (!products?.length) return null;

    return (
        <div className={styles.grid}>
            {products.flatMap(p =>
                productCards(p, keyword).map(c => (
                    <ProductCard key={c.key} product={p} variant={c.variant} />
                ))
            )}
        </div>
    );
}
