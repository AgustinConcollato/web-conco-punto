import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProduct } from '../../../catalog/services/catalogService';
import { getPrice, usePriceContext } from '../../../../context/PriceContext';
import { formatPrice } from '../../../../utils/formatPrice';
import { AttributeList } from '../../components/AttributeList/AttributeList';
import { ImageGallery } from '../../components/ImageGallery/ImageGallery';
import styles from './VariantPage.module.css';

export function VariantPage() {
    const { id, vid } = useParams();
    const { priceListId } = usePriceContext();
    const [product, setProduct] = useState(null);
    const [variant, setVariant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // null | 'not_found' | 'network'
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        setLoading(true);
        setError(null);
        getProduct(id, priceListId)
            .then(data => {
                if (data?.error) { setError('not_found'); return; }
                setProduct(data);
                const v = data.variants?.find(v => String(v.id) === String(vid));
                if (!v) { setError('not_found'); return; }
                setVariant(v);
            })
            .catch(() => setError('network'))
            .finally(() => setLoading(false));
    }, [id, vid, retryKey, priceListId]);

    if (loading) return (
        <div className={styles.page} aria-busy="true">
            <div className={styles.skel} style={{ height: 14, width: 220 }} aria-hidden="true" />
            <div className={styles.layout}>
                <div className={styles.gallery_col}>
                    <div className={`${styles.skel} ${styles.skel_gallery}`} aria-hidden="true" />
                </div>
                <div className={styles.info_col}>
                    <div className={styles.skel} style={{ height: 11, width: 110 }} aria-hidden="true" />
                    <div className={styles.skel} style={{ height: 36, width: '80%' }} aria-hidden="true" />
                    <div className={styles.skel} style={{ height: 24, width: 70 }} aria-hidden="true" />
                    <div className={`${styles.skel} ${styles.skel_price_block}`} aria-hidden="true" />
                    <div className={styles.skel} style={{ height: 28, width: 100 }} aria-hidden="true" />
                </div>
            </div>
        </div>
    );

    if (error === 'not_found' || (!loading && !variant)) return (
        <div className={styles.error_state}>
            <p className={styles.error_title}>Variante no encontrada.</p>
            <p className={styles.error_body}>Es posible que haya sido dada de baja.</p>
            <Link to="/" className={styles.not_found_link}>← Volver al catálogo</Link>
        </div>
    );

    if (error === 'network') return (
        <div className={styles.error_state}>
            <p className={styles.error_title}>No pudimos cargar la variante.</p>
            <p className={styles.error_body}>Verificá tu conexión e intentá de nuevo.</p>
            <button className={styles.retry_btn} onClick={() => setRetryKey(k => k + 1)}>
                Reintentar
            </button>
        </div>
    );

    const price = getPrice(product.price_lists, priceListId);
    const images = variant.images?.length ? variant.images : product.images;
    const categories = product.categories?.map(c => c.name).join(' › ');

    return (
        <div className={styles.page}>
            <div className={styles.breadcrumb}>
                <Link to="/" className={styles.bc_link}>Catálogo</Link>
                <span className={styles.bc_sep}>›</span>
                <Link to={`/productos/${id}`} className={styles.bc_link}>{product.name}</Link>
                <span className={styles.bc_sep}>›</span>
                <span>{variant.sku ?? `Variante ${vid}`}</span>
            </div>

            <div className={styles.layout}>
                <div className={styles.gallery_col}>
                    <ImageGallery images={images} />
                </div>

                <div className={styles.info_col}>
                    {categories && <p className={styles.category}>{categories}</p>}
                    <h1 className={styles.name}>{product.name}</h1>
                    {variant.sku && <p className={styles.sku}>{variant.sku}</p>}

                    {variant.attribute_values?.length > 0 && (
                        <div className={styles.attrs_section}>
                            <AttributeList attributeValues={variant.attribute_values} />
                        </div>
                    )}

                    <div className={styles.price_section}>
                        {price !== null ? (
                            <p className={styles.price}>{formatPrice(price)}</p>
                        ) : (
                            <p className={styles.no_price}>Consultar precio</p>
                        )}
                    </div>

                    <div className={styles.stock_row}>
                        <span className={variant.stock > 0 ? styles.in_stock : styles.out_stock}>
                            {variant.stock > 0 ? `${variant.stock} en stock` : 'Sin stock'}
                        </span>
                    </div>

                    {product.description && (
                        <p className={styles.description}>{product.description}</p>
                    )}
                </div>
            </div>

            <Link to={`/productos/${id}`} className={styles.back_product}>
                ← Ver todas las variantes de {product.name}
            </Link>
        </div>
    );
}
