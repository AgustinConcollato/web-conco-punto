import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { IMAGE_URL } from '../../../../config/api';
import { formatPrice } from '../../../../utils/formatPrice';
import { calcEffectivePrice } from '../../../../utils/promo';
import styles from './CartNotification.module.css';

const DISMISS_MS = 2800;

export function CartNotification({ item, onClose }) {
    const timerRef = useRef(null);

    const startTimer = () => {
        timerRef.current = setTimeout(onClose, DISMISS_MS);
    };

    const clearTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    useEffect(() => {
        if (!item) return;
        startTimer();
        return clearTimer;
    }, [item]);

    if (!item) return null;

    return (
        <div
            className={styles.notification}
            onMouseEnter={clearTimer}
            onMouseLeave={startTimer}
        >
            <div className={styles.header}>
                <span className={styles.success}>
                    <i className="hgi hgi-stroke hgi-rounded hgi-checkmark-circle-02" />
                    Producto agregado
                </span>
                <button onClick={onClose} className={styles.close} aria-label="Cerrar">×</button>
            </div>
            <div className={styles.product}>
                {item.image_url
                    ? <img src={`${IMAGE_URL}/${item.image_url}`} alt={item.name} className={styles.img} />
                    : <div className={styles.img_placeholder}><i className="hgi hgi-stroke hgi-rounded hgi-image-not-found-01" /></div>
                }
                <div className={styles.info}>
                    <p className={styles.name}>{item.name}</p>
                    {item.sku && <p className={styles.sku}>{item.sku}</p>}
                    <p className={styles.price}>
                        {formatPrice(calcEffectivePrice(item.price, item.promo ?? null, item.qty))}
                        <span className={styles.qty}> × {item.qty}</span>
                    </p>
                </div>
            </div>
            <Link to="/carrito" onClick={onClose} className={styles.cart_link}>
                Ver carrito
                <i className="hgi hgi-stroke hgi-rounded hgi-arrow-right-01" />
            </Link>
        </div>
    );
}
