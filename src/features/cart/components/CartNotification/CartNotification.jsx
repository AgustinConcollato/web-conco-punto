import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IMAGE_URL } from '../../../../config/api';
import { formatPrice } from '../../../../utils/formatPrice';
import { calcEffectivePrice } from '../../../../utils/promo';
import styles from './CartNotification.module.css';

const DISMISS_MS = 2800;
const SWITCH_MS = 180;

function isSameItem(a, b) {
    return a.product_id === b.product_id && (a.variant_id ?? null) === (b.variant_id ?? null);
}

export function CartNotification({ item, onClose }) {
    const [displayItem, setDisplayItem] = useState(null);
    const [leaving, setLeaving] = useState(false);
    const [remountKey, setRemountKey] = useState(0);
    const dismissTimerRef = useRef(null);
    const switchTimerRef = useRef(null);

    const startDismissTimer = () => {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = setTimeout(onClose, DISMISS_MS);
    };
    const stopDismissTimer = () => clearTimeout(dismissTimerRef.current);

    useEffect(() => {
        clearTimeout(switchTimerRef.current);
        stopDismissTimer();

        if (!item) {
            if (displayItem) {
                setLeaving(true);
                switchTimerRef.current = setTimeout(() => {
                    setDisplayItem(null);
                    setLeaving(false);
                }, SWITCH_MS);
            }
            return;
        }

        if (displayItem && isSameItem(displayItem, item)) {
            // mismo producto: solo actualiza la cantidad, sin reanimar
            setLeaving(false);
            setDisplayItem(item);
        } else if (displayItem) {
            // producto distinto mientras se mostraba otro: sale y vuelve a entrar
            setLeaving(true);
            switchTimerRef.current = setTimeout(() => {
                setDisplayItem(item);
                setRemountKey(k => k + 1);
                setLeaving(false);
                startDismissTimer();
            }, SWITCH_MS);
            return;
        } else {
            setDisplayItem(item);
        }

        startDismissTimer();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item]);

    useEffect(() => () => {
        stopDismissTimer();
        clearTimeout(switchTimerRef.current);
    }, []);

    if (!displayItem) return null;

    return (
        <div
            key={remountKey}
            className={`${styles.notification} ${leaving ? styles.leaving : ''}`}
            onMouseEnter={stopDismissTimer}
            onMouseLeave={startDismissTimer}
        >
            <div className={styles.header}>
                <span className={styles.success}>
                    <i className="hgi hgi-stroke hgi-rounded hgi-checkmark-circle-02" />
                    Producto agregado
                </span>
                <button onClick={onClose} className={styles.close} aria-label="Cerrar">×</button>
            </div>
            <div className={styles.product}>
                {displayItem.image_url
                    ? <img src={`${IMAGE_URL}/${displayItem.image_url}`} alt={displayItem.name} className={styles.img} />
                    : <div className={styles.img_placeholder}><i className="hgi hgi-stroke hgi-rounded hgi-image-not-found-01" /></div>
                }
                <div className={styles.info}>
                    <p className={styles.name}>{displayItem.name}</p>
                    {displayItem.sku && <p className={styles.sku}>{displayItem.sku}</p>}
                    <p className={styles.price}>
                        {formatPrice(calcEffectivePrice(displayItem.price, displayItem.promo ?? null, displayItem.qty))}
                        <span className={styles.qty}> × {displayItem.qty}</span>
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
