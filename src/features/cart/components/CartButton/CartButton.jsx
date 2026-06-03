import { Link } from 'react-router-dom';
import { useCartContext } from '../../../../context/CartContext';
import styles from './CartButton.module.css';

export function CartButton() {
    const { itemCount } = useCartContext();

    return (
        <Link className={styles.btn} to={'/carrito'} aria-label={`Ver carrito, ${itemCount} productos`}>
            <i className="hgi hgi-stroke hgi-rounded hgi-shopping-cart-02"></i>
            {itemCount > 0 && (
                <span className={styles.badge} aria-hidden="true">{itemCount > 99 ? '99+' : itemCount}</span>
            )}
        </Link>
    );
}
