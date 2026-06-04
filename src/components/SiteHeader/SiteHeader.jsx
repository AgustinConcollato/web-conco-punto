import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import { useCartContext } from '../../context/CartContext';
import { useClientAuth } from '../../context/ClientAuthContext';
import { CartButton } from '../../features/cart/components/CartButton/CartButton';
import { CartNotification } from '../../features/cart/components/CartNotification/CartNotification';
import { SearchBar } from '../../features/catalog/components/SearchBar/SearchBar';
import { UserMenu } from '../../features/account/components/UserMenu/UserMenu';
import { CategoryDrawer } from '../CategoryDrawer/CategoryDrawer';
import styles from './SiteHeader.module.css';

export function SiteHeader() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { lastAdded, clearLastAdded } = useCartContext();
    const { client } = useClientAuth();

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <div className={styles.actions}>
                    <Link to="/" className={styles.brand}>
                        <img src={logo} alt="Logo Conco y Punto" title='Página de inicio Conco y Punto' />
                    </Link>
                    <button className={styles.cat_btn} onClick={() => setDrawerOpen(true)}>
                        <span aria-hidden="true">☰</span> Categorías
                    </button>
                </div>
                <div className={styles.search_wrap}>
                    <SearchBar />
                </div>
                <div className={styles.container}>
                    {client ? (
                        <UserMenu />
                    ) : (
                        <Link to="/iniciar-sesion" className={styles.session_login}>Iniciar sesión</Link>
                    )}
                    <CartButton />
                    <CartNotification item={lastAdded} onClose={clearLastAdded} />
                </div>
            </div>
            <CategoryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </header>
    );
}
