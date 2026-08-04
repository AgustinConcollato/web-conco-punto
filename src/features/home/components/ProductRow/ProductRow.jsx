import { ProductCard } from '../../../catalog/components/ProductCard/ProductCard';
import { HorizontalScroller } from '../../../../components/HorizontalScroller/HorizontalScroller';
import { productCards } from '../../../../utils/productCards';
import styles from './ProductRow.module.css';

export function ProductRow({ products, keyword }) {
    if (!products?.length) return null;

    return (
        <HorizontalScroller className={styles.row}>
            {products.flatMap(p =>
                productCards(p, keyword).map(c => (
                    <div key={c.key} className={styles.card_wrap}>
                        <ProductCard product={p} variant={c.variant} />
                    </div>
                ))
            )}
        </HorizontalScroller>
    );
}
