import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IMAGE_URL } from '../../../../config/api';
import { getPrice, usePriceContext } from '../../../../context/PriceContext';
import { useCartContext } from '../../../../context/CartContext';
import { formatPrice } from '../../../../utils/formatPrice';
import { getActivePromo, calcPromoPrice, promoLabel, promoEndLabel } from '../../../../utils/promo';
import styles from './ProductCard.module.css';

export function ProductCard({ product, variant }) {
    const { priceListId } = usePriceContext();
    const { addItem } = useCartContext();
    const price = getPrice(product.price_lists, priceListId);

    const promo = getActivePromo(product.promotions, priceListId);
    const promoPrice = calcPromoPrice(price, promo);

    const rawImages = variant?.images?.length > 0 ? variant.images : product.images ?? [];
    const images = [...rawImages].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    const [imgIdx, setImgIdx] = useState(0);
    const thumb = images[imgIdx]?.thumbnail_path;
    const hasMultiple = images.length > 1;

    const stock = variant != null ? variant.stock : product.stock;
    const sku = variant ? (variant.sku ?? product.sku) : product.sku;
    const to = variant ? `/productos/${product.id}/variante/${variant.id}` : `/productos/${product.id}`;
    const variantLabel = variant
        ? (variant.attribute_values ?? []).map(av => av.value).join(' · ')
        : null;

    const prev = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setImgIdx(i => (i - 1 + images.length) % images.length);
    };
    const next = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setImgIdx(i => (i + 1) % images.length);
    };

    const [added, setAdded] = useState(false);
    const [blocked, setBlocked] = useState(false);
    const addedTimerRef = useRef(null);
    const blockedTimerRef = useRef(null);
    useEffect(() => () => {
        if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
        if (blockedTimerRef.current) clearTimeout(blockedTimerRef.current);
    }, []);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const addedQty = addItem({
            product_id: product.id,
            variant_id: variant?.id ?? null,
            name: product.name,
            sku,
            price,
            promo: promo ?? null,
            qty: 1,
            stock,
            image_url: thumb ?? null,
        });
        if (addedQty <= 0) {
            setBlocked(true);
            if (blockedTimerRef.current) clearTimeout(blockedTimerRef.current);
            blockedTimerRef.current = setTimeout(() => setBlocked(false), 500);
            return;
        }
        setAdded(true);
        if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
        addedTimerRef.current = setTimeout(() => setAdded(false), 1500);
    };

    return (
        <Link
            to={to}
            className={styles.card}
            title={product.name}
        >
            <div className={styles.img_wrap}>
                {thumb ? (
                    <img
                        src={`${IMAGE_URL}/${thumb}`}
                        alt={product.name}
                        className={styles.img}
                        loading="lazy"
                    />
                ) : (
                    <div className={styles.no_img}>Sin imagen</div>
                )}
                {stock === 0 && (
                    <span className={styles.out_badge}>Sin stock</span>
                )}
                {hasMultiple && (
                    <>
                        <button className={`${styles.arrow_btn} ${styles.arrow_prev}`} onClick={prev} tabIndex={-1}>‹</button>
                        <button className={`${styles.arrow_btn} ${styles.arrow_next}`} onClick={next} tabIndex={-1}>›</button>
                        <div className={styles.dots}>
                            {images.map((_, i) => (
                                <span key={i} className={`${styles.dot} ${i === imgIdx ? styles.dot_active : ''}`} />
                            ))}
                        </div>
                    </>
                )}
                {stock > 0 && price !== null && (
                    <button
                        className={`${styles.add_btn} ${added ? styles.add_btn_done : ''} ${blocked ? styles.add_btn_blocked : ''}`}
                        onClick={handleAddToCart}
                        title="Agregar al carrito"
                    >
                        <i className={`hgi hgi-stroke hgi-rounded ${added ? 'hgi-shopping-cart-check-02' : 'hgi-shopping-cart-add-02'}`} />
                    </button>
                )}
            </div>
            <div className={styles.body}>
                <p className={styles.name}>{product.name}</p>
                {variantLabel && <p className={styles.variant_label}>{variantLabel}</p>}
                <div className={styles.info}>
                    {sku && <p className={styles.sku}>{sku}</p>}
                    {stock != null && (
                        <p className={styles.stock}>
                            {stock === 0 ? 'Sin stock' : `Stock: ${stock}`}
                        </p>
                    )}
                </div>
                {price !== null ? (
                    promo && promoPrice !== null ? (
                        <div className={styles.promo_block}>
                            <span className={styles.price_original}>{formatPrice(price)}</span>
                            <div className={styles.price_badge_promo}>
                                <p className={styles.price_promo}>{formatPrice(promoPrice)}</p>
                                <span className={styles.promo_badge}>{promoLabel(promo, formatPrice)}</span>
                            </div>
                            {promo.discount_type === 'second_unit_percentage' ? (
                                <span className={styles.promo_cond}>Precio promedio x2</span>
                            ) : promo.min_quantity > 1 && (
                                <span className={styles.promo_cond}>Comprando {promo.min_quantity} o más</span>
                            )}
                            {promoEndLabel(promo) && (
                                <span className={styles.promo_cond}>{promoEndLabel(promo)}</span>
                            )}
                        </div>
                    ) : (
                        <p className={styles.price}>{formatPrice(price)}</p>
                    )
                ) : (
                    <p className={styles.no_price}>Consultar precio</p>
                )}
            </div>
        </Link>
    );
}
