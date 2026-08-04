import { BannerCarousel } from '../BannerCarousel/BannerCarousel';
import { ProductGrid } from '../ProductGrid/ProductGrid';
import { ProductRow } from '../ProductRow/ProductRow';
import styles from './BannerProductsSection.module.css';

export function BannerProductsSection({ settings, title, products, keyword }) {
    const hasSlides = (settings?.slides ?? []).length > 0;
    const hasProducts = products?.length > 0;
    if (!hasSlides && !hasProducts) return null;

    const ProductsLayout = settings?.layout === 'scroll' ? ProductRow : ProductGrid;

    return (
        <section className={styles.section}>
            {hasSlides && (
                <div className={styles.hero}>
                    <BannerCarousel settings={settings} />
                    <div className={styles.fade} />
                </div>
            )}
            {hasProducts && (
                <div className={hasSlides ? styles.products_overlap : styles.products}>
                    {title && <h2 className={styles.title}>{title}</h2>}
                    <ProductsLayout products={products} keyword={keyword} />
                </div>
            )}
        </section>
    );
}
