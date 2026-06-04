import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { IMAGE_URL } from '../../../../config/api';
import { getPrice, usePriceContext } from '../../../../context/PriceContext';
import { useCartContext } from '../../../../context/CartContext';
import { formatPrice } from '../../../../utils/formatPrice';
import { getActivePromo, calcPromoPrice, promoLabel, promoEndLabel } from '../../../../utils/promo';
import { getProduct } from '../../../catalog/services/catalogService';
import { AttributeList } from '../../components/AttributeList/AttributeList';
import { ImageGallery } from '../../components/ImageGallery/ImageGallery';
import styles from './ProductPage.module.css';

function mergeAttrs(baseAttrs, variantAttrValues) {
    const variantNames = new Set(
        variantAttrValues?.map(av => av.category_attribute?.name) ?? []
    );
    return [
        ...(baseAttrs ?? []).filter(av => !variantNames.has(av.category_attribute?.name)),
        ...(variantAttrValues ?? []),
    ];
}

function getDiffAttrName(baseAttrs, variants) {
    const allOptions = [
        baseAttrs ?? [],
        ...(variants ?? []).map(v => mergeAttrs(baseAttrs, v.attribute_values)),
    ];
    const attrMap = {};
    allOptions.forEach(attrs => {
        attrs.forEach(av => {
            const key = av.category_attribute?.name;
            if (!key) return;
            if (!attrMap[key]) attrMap[key] = new Set();
            attrMap[key].add(String(av.value));
        });
    });
    const found = Object.entries(attrMap).find(([, vals]) => vals.size > 1);
    return found ? found[0] : null;
}

function getAttrValue(attrValues, attrName) {
    return attrValues?.find(av => av.category_attribute?.name === attrName)?.value ?? null;
}

export function ProductPage() {
    const { id, vid } = useParams();
    const navigate = useNavigate();
    const { priceListId } = usePriceContext();
    const { addItem, items: cartItems } = useCartContext();
    const [product, setProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // null | 'not_found' | 'network'
    const [retryKey, setRetryKey] = useState(0);
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);
    const addedTimerRef = useRef(null);

    useEffect(() => () => { if (addedTimerRef.current) clearTimeout(addedTimerRef.current); }, []);

    useEffect(() => {
        setLoading(true);
        setError(null);
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        })

        getProduct(id, priceListId)
            .then(data => {
                if (data?.error) { setError('not_found'); return; }

                setProduct(data);
                document.title = data.name;
                if (vid) {
                    const match = data.variants?.find(v => String(v.id) === String(vid));
                    setSelectedVariant(match ?? null);
                } else {
                    setSelectedVariant(null);
                }
            })
            .catch(() => setError('network'))
            .finally(() => setLoading(false));

        return () => { document.title = 'Conco y Punto'; };
    }, [id, retryKey, priceListId]);


    useEffect(() => {
        setQty(1)
    }, [vid])
    // id, vid,

    const diffAttrName = useMemo(
        () => getDiffAttrName(product?.attribute_values, product?.variants),
        [product]
    );

    if (loading) return (
        <div className={styles.page} aria-busy="true">
            <div className={styles.skel} style={{ height: 14, width: 140 }} aria-hidden="true" />
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

    if (error === 'not_found' || (!loading && !product)) return (
        <div className={styles.error_state}>
            <p className={styles.error_title}>Producto no encontrado.</p>
            <p className={styles.error_body}>El producto ya no está disponible o el enlace es incorrecto.</p>
            <Link to="/" className={styles.not_found_link}>← Volver al catálogo</Link>
        </div>
    );

    if (error === 'network') return (
        <div className={styles.error_state}>
            <p className={styles.error_title}>No pudimos cargar el producto.</p>
            <p className={styles.error_body}>Verificá tu conexión e intentá de nuevo.</p>
            <button className={styles.retry_btn} onClick={() => setRetryKey(k => k + 1)}>
                Reintentar
            </button>
        </div>
    );

    const price = getPrice(product.price_lists, priceListId);
    const promo = getActivePromo(product.promotions, priceListId);
    const promoPrice = calcPromoPrice(price, promo);
    const categories = product.categories?.map(c => {
        const to = c.parent ? `/categoria/${c.parent.slug}/${c.slug}` : `/categoria/${c.slug}`;
        return <><Link to={to}>{c.name}</Link> <span> › </span></>;
    });
    const hasVariants = product.variants?.length > 0;
    const firstCategoryTo = product.categories?.[0]
        ? (product.categories[0].parent
            ? `/categoria/${product.categories[0].parent.slug}/${product.categories[0].slug}`
            : `/categoria/${product.categories[0].slug}`)
        : '/';
    const firstCategoryName = product.categories?.[0]?.name ?? null;

    const displayImages = (selectedVariant?.images?.length ? selectedVariant.images : product.images) ?? [];
    const displayStock = selectedVariant !== null ? selectedVariant.stock : product.stock;
    const displaySku = selectedVariant?.sku ?? product.sku;

    const inCart = cartItems.find(i =>
        i.product_id === product.id &&
        (i.variant_id ?? null) === (selectedVariant?.id ?? null)
    )?.qty ?? 0;
    const available = Math.max(0, displayStock - inCart);

    const effectiveAttrs = selectedVariant
        ? mergeAttrs(product.attribute_values, selectedVariant.attribute_values)
        : (product.attribute_values ?? []);
    const displayAttrs = effectiveAttrs;
    const selectedAttrValue = diffAttrName ? getAttrValue(effectiveAttrs, diffAttrName) : null;

    const handleSelectVariant = (v) => {
        setSelectedVariant(v);
        navigate(`/productos/${id}/variante/${v.id}`, { replace: true });
    };

    return (
        <div className={styles.page}>
            <Link to={firstCategoryTo} className={styles.back}>← {firstCategoryName ?? 'Catálogo'}</Link>

            <div className={styles.layout}>
                <div className={styles.gallery_col}>
                    <ImageGallery key={selectedVariant?.id ?? 'product'} images={displayImages} alt={product.name} />
                </div>

                <div className={styles.info_col}>
                    {categories && <div className={styles.category}>{categories}</div>}
                    <h1 className={styles.name}>{product.name}</h1>
                    {displaySku && <p className={styles.sku}>{displaySku}</p>}

                    {hasVariants && (
                        <div className={styles.variant_selector}>
                            <p className={styles.variant_label}>
                                {diffAttrName
                                    ? <>{diffAttrName}: <strong>{selectedAttrValue ?? '—'}</strong></>
                                    : <>Variante: <strong>{selectedVariant?.sku ?? product.sku ?? '—'}</strong></>
                                }
                            </p>
                            <div className={styles.swatches}>
                                {/* Base product swatch */}
                                {(() => {
                                    const baseLabel = diffAttrName
                                        ? getAttrValue(product.attribute_values ?? [], diffAttrName)
                                        : (product.sku ?? null);
                                    const thumb = product.images?.[0]?.thumbnail_path;
                                    return (
                                        <div className={styles.swatch_wrap}>
                                            <button
                                                className={`${styles.swatch} ${selectedVariant === null ? styles.swatch_active : ''}`}
                                                onClick={() => { setSelectedVariant(null); navigate(`/productos/${id}`, { replace: true }); }}
                                                disabled={product.stock <= 0}
                                            >
                                                {thumb
                                                    ? <img src={`${IMAGE_URL}/${thumb}`} alt={baseLabel ?? ''} />
                                                    : <span className={styles.swatch_text}>{baseLabel ?? '?'}</span>
                                                }
                                            </button>
                                            <div className={styles.swatch_tooltip}>
                                                <span className={styles.tooltip_label}>
                                                    {diffAttrName
                                                        ? <>{diffAttrName}: <strong>{baseLabel ?? '—'}</strong></>
                                                        : <>{product.sku ?? 'Base'}</>
                                                    }
                                                </span>
                                                <span className={styles.tooltip_stock}>Stock: {product.stock}</span>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Variant swatches */}
                                {product.variants.map(v => {
                                    const thumb = v.images?.[0]?.thumbnail_path
                                        ?? product.images?.[0]?.thumbnail_path;
                                    const isSelected = selectedVariant?.id === v.id;
                                    const vEffective = mergeAttrs(product.attribute_values, v.attribute_values);
                                    const label = diffAttrName
                                        ? getAttrValue(vEffective, diffAttrName)
                                        : (v.sku ?? null);
                                    return (
                                        <div key={v.id} className={styles.swatch_wrap}>
                                            <button
                                                className={`${styles.swatch} ${isSelected ? styles.swatch_active : ''}`}
                                                onClick={() => handleSelectVariant(v)}
                                                disabled={!v.is_active || v.stock <= 0}
                                            >
                                                {thumb
                                                    ? <img src={`${IMAGE_URL}/${thumb}`} alt={label ?? ''} />
                                                    : <span className={styles.swatch_text}>{label ?? '?'}</span>
                                                }
                                            </button>
                                            <div className={styles.swatch_tooltip}>
                                                <span className={styles.tooltip_label}>
                                                    {diffAttrName
                                                        ? <>{diffAttrName}: <strong>{label ?? '—'}</strong></>
                                                        : <>{v.sku ?? 'Variante'}</>
                                                    }
                                                </span>
                                                <span className={styles.tooltip_stock}>Stock: {v.stock}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className={styles.price_section}>
                        {price !== null ? (
                            promo && promoPrice !== null ? (
                                <>
                                    <p className={styles.price_original}>{formatPrice(price)}</p>
                                    <p className={styles.price}>{formatPrice(promoPrice)}</p>
                                    <div className={styles.promo_row}>
                                        <span className={styles.promo_badge}>{promoLabel(promo, formatPrice)}</span>
                                        {promo.discount_type === 'second_unit_percentage' ? (
                                            <span className={styles.promo_cond}>Precio promedio comprando 2 unidades</span>
                                        ) : promo.min_quantity > 1 && (
                                            <span className={styles.promo_cond}>Comprando {promo.min_quantity} o más unidades</span>
                                        )}
                                        {promoEndLabel(promo) && (
                                            <p className={styles.promo_cond}>{promoEndLabel(promo)}</p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p className={styles.price}>{formatPrice(price)}</p>
                            )
                        ) : (
                            <p className={styles.no_price}>Consultar precio</p>
                        )}
                    </div>

                    <div className={styles.stock_row}>
                        <span className={styles.stock}>
                            {displayStock > 0 ? `Stock: ${displayStock}` : 'Sin stock'}
                        </span>
                        {inCart > 0 && displayStock > 0 && (
                            <span className={styles.in_cart_note}>{inCart} en el carrito</span>
                        )}
                        {displayStock <= 0 && (
                            <Link to={firstCategoryTo} className={styles.out_stock_link}>
                                {firstCategoryName ? `Ver más en ${firstCategoryName}` : 'Ver más productos'}
                            </Link>
                        )}
                    </div>

                    {/*
                        Cart / purchase section — uncomment when cart + OCA E-Pack integration is ready.
                        Also add: const [qty, setQty] = useState(1); to component state.
                            */}

                    <div className={styles.cart_section}>
                        <div className={styles.qty_row}>
                            <span className={styles.qty_label}>Cantidad</span>
                            <div className={styles.qty_control}>
                                <button
                                    className={styles.qty_btn}
                                    onClick={() => setQty(q => Math.max(1, q - 1))}
                                    aria-label="Reducir cantidad"
                                >−</button>
                                <span className={styles.qty_value}>{qty}</span>
                                <button
                                    className={styles.qty_btn}
                                    onClick={() => setQty(q => q < available ? q + 1 : q)}
                                    aria-label="Aumentar cantidad"
                                >+</button>
                            </div>
                        </div>

                        {/* {priceListId === 2 && <button className={styles.cta_btn}>Comprar ahora</button>} */}
                        <button
                            className={styles.asc_btn}
                            disabled={displayStock <= 0 || available <= 0}
                            onClick={() => {
                                addItem({
                                    product_id: product.id,
                                    variant_id: selectedVariant?.id ?? null,
                                    name: product.name,
                                    sku: displaySku,
                                    price: price ?? 0,
                                    promo: promo ?? null,
                                    qty,
                                    stock: displayStock,
                                    image_url: displayImages[0]?.thumbnail_path ?? null,
                                });
                                if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
                                setAdded(true);
                                addedTimerRef.current = setTimeout(() => setAdded(false), 1500);
                            }}
                        >
                            {added ?
                                <i className="hgi hgi-stroke hgi-rounded hgi-shopping-cart-check-02"></i> :
                                available <= 0 ? 'Máximo en carrito' :
                                    <>
                                        <i className="hgi hgi-stroke hgi-rounded hgi-shopping-cart-add-02"></i>
                                        Agregar al carrito
                                    </>
                            }
                        </button>
                    </div>

                    {product.description && (
                        <pre className={styles.description}>{product.description}</pre>
                    )}

                    {displayAttrs?.length > 0 && (
                        <div className={styles.section}>
                            <h3 className={styles.section_title}>Características</h3>
                            <AttributeList attributeValues={displayAttrs} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
