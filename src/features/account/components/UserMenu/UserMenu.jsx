import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useClientAuth } from '../../../../context/ClientAuthContext';
import styles from './UserMenu.module.css';

export function UserMenu() {
    const { client, logout } = useClientAuth();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;

        const onClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };

        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    return (
        <div className={styles.wrap} ref={ref}>
            <button
                className={styles.btn}
                onClick={() => setOpen(o => !o)}
                aria-label="Menú de usuario"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <i className="hgi hgi-stroke hgi-rounded hgi-user"></i>
            </button>

            {open && (
                <div className={styles.menu} role="menu">
                    {client?.name && <p className={styles.menu_header}>{client.name}</p>}
                    <Link to="/perfil" className={styles.menu_item} role="menuitem" onClick={() => setOpen(false)}>
                        Mi perfil
                    </Link>
                    <button
                        className={`${styles.menu_item} ${styles.menu_logout}`}
                        role="menuitem"
                        onClick={() => { setOpen(false); logout(); }}
                    >
                        Salir
                    </button>
                </div>
            )}
        </div>
    );
}
