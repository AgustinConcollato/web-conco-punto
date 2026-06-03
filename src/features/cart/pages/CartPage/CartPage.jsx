import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IMAGE_URL } from '../../../../config/api';
import { useCartContext } from '../../../../context/CartContext';
import { formatPrice } from '../../../../utils/formatPrice';
import { calcEffectivePrice } from '../../../../utils/promo';
import { useCartSync } from '../../hooks/useCartSync';
import styles from './CartPage.module.css';

export function CartPage() {
    const { items, removeItem, updateQty, syncCartStocks, cartTotal } = useCartContext();
    const navigate = useNavigate();
    const { syncing, changes } = useCartSync({ items, syncCartStocks });
    const [dismissed, setDismissed] = useState(false);

    useEffect(()=> {
        document.title = 'Carrito de compras'
    },[]);

    if (items.length === 0) {
        return (
            <div className={styles.empty}>
                <p className={styles.empty_title}>Tu carrito está vacío</p>
                <Link to="/" className={styles.empty_link}>Ver productos</Link>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Carrito</h1>

            {syncing && (
                <p className={styles.sync_loading}>Verificando disponibilidad…</p>
            )}

            {!dismissed && changes.length > 0 && (
                <div className={styles.sync_banner}>
                    <div className={styles.sync_banner_header}>
                        <span className={styles.sync_banner_title}>Actualizamos tu carrito</span>
                        <button className={styles.sync_dismiss} onClick={() => setDismissed(true)} aria-label="Cerrar">×</button>
                    </div>
                    <ul className={styles.sync_list}>
                        {changes.map((c, i) => (
                            <li key={i}>
                                {c.type === 'removed'
                                    ? <><strong>"{c.name}{c.sku ? ` · ${c.sku}` : ''}"</strong> fue eliminado por falta de stock.</>
                                    : <><strong>"{c.name}{c.sku ? ` · ${c.sku}` : ''}"</strong> fue reducido de {c.from} a {c.to} unidades.</>
                                }
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className={styles.layout}>
                <ul className={styles.list}>
                    {items.map(item => {
                        const effectivePrice = calcEffectivePrice(item.price, item.promo ?? null, item.qty);
                        const hasDiscount = effectivePrice < item.price;
                        return (
                            <li key={`${item.product_id}-${item.variant_id ?? 'base'}`} className={styles.item}>
                                <div className={styles.item_img}>
                                    {item.image_url
                                        ? <img src={`${IMAGE_URL}/${item.image_url}`} alt={item.name} />
                                        : <div className={styles.img_placeholder} />
                                    }
                                </div>
                                <div className={styles.item_info}>
                                    <Link to={item.variant_id ?
                                        `/productos/${item.product_id}/variante/${item.variant_id}` :
                                        `/productos/${item.product_id}`
                                    }
                                        className={styles.item_name}
                                    >{item.name}</Link>
                                    {item.sku && <p className={styles.item_sku}>{item.sku}</p>}
                                    <p className={styles.item_unit}>
                                        {hasDiscount && <span className={styles.item_price_original}>{formatPrice(item.price)}</span>}
                                        {formatPrice(effectivePrice)} c/u
                                        {hasDiscount && item.promo?.discount_type === 'second_unit_percentage' &&
                                            <span className={styles.item_promo_note}> · 2ª unidad -{item.promo.discount_value}%</span>
                                        }
                                    </p>
                                    <button
                                        className={styles.remove_btn}
                                        onClick={() => removeItem(item.product_id, item.variant_id)}
                                        aria-label="Eliminar producto"
                                    >Eliminar</button>
                                </div>
                                <div className={styles.item_qty}>
                                    <button
                                        className={styles.qty_btn}
                                        onClick={() => updateQty(item.product_id, item.variant_id, item.qty - 1)}
                                        aria-label="Reducir cantidad"
                                    >−</button>
                                    <span className={styles.qty_val}>{item.qty}</span>
                                    <button
                                        className={styles.qty_btn}
                                        onClick={() => updateQty(item.product_id, item.variant_id, item.qty + 1)}
                                        disabled={item.stock != null && item.qty >= item.stock}
                                        aria-label="Aumentar cantidad"
                                    >+</button>
                                </div>
                                <p className={styles.item_subtotal}>{formatPrice(effectivePrice * item.qty)}</p>
                            </li>
                        );
                    })}
                </ul>

                <div className={styles.summary}>
                    <div className={styles.summary_row}>
                        <span>Total</span>
                        <strong>{formatPrice(cartTotal)}</strong>
                    </div>
                    <button className={styles.checkout_btn} onClick={() => navigate('/checkout')}>
                        Finalizar pedido
                    </button>
                    <Link to="/" className={styles.continue_link}>← Seguir comprando</Link>
                </div>
            </div>
        </div>
    );
}
