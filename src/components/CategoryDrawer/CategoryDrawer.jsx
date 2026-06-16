import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getCategories } from '../../features/catalog/services/catalogService';
import styles from './CategoryDrawer.module.css';

export function CategoryDrawer({ open, onClose }) {
    const [categories, setCategories] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const location = useLocation();
    const drawerRef = useRef(null);
    const previousFocusRef = useRef(null);

    useEffect(() => {
        if (open && categories.length === 0) {
            getCategories().then(cats => {
                setCategories(cats);
                setSelectedId(cats[0]?.id ?? null);
            }).catch(() => {});
        } else if (open && selectedId === null && categories.length > 0) {
            setSelectedId(categories[0].id);
        }
    }, [open]);

    useEffect(() => {
        if (open) onClose();
    }, [location.pathname]);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open]);

    useEffect(() => {
        if (open) {
            previousFocusRef.current = document.activeElement;
        } else if (previousFocusRef.current) {
            previousFocusRef.current.focus();
            previousFocusRef.current = null;
        }
    }, [open]);

    useEffect(() => {
        if (!open || !drawerRef.current) return;
        const drawer = drawerRef.current;
        const getFocusables = () => Array.from(
            drawer.querySelectorAll('button:not([disabled]), a[href]')
        );
        getFocusables()[0]?.focus();

        const handleTab = (e) => {
            if (e.key !== 'Tab') return;
            const items = getFocusables();
            if (!items.length) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };
        document.addEventListener('keydown', handleTab);
        return () => document.removeEventListener('keydown', handleTab);
    }, [open]);

    if (!open) return null;

    const selectedParent = categories.find(c => c.id === selectedId) ?? null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                ref={drawerRef}
                className={styles.drawer}
                role="dialog"
                aria-modal="true"
                aria-label="Categorías"
                onClick={e => e.stopPropagation()}
            >
                <div className={styles.left}>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`${styles.parent_btn} ${cat.id === selectedId ? styles.parent_active : ''}`}
                            onClick={() => setSelectedId(cat.id)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
                <div className={styles.right}>
                    <div className={styles.right_header}>
                        <Link
                            to={`/categoria/${selectedParent?.slug}`}
                            className={styles.parent_link}
                        >
                            {selectedParent?.name}

                            <button> Ver todo</button>
                        </Link>
                        <button className={styles.close_btn} onClick={onClose} aria-label="Cerrar">×</button>
                    </div>
                    <div className={styles.children}>
                        {(selectedParent?.children ?? []).map(child => (
                            <Link
                                key={child.id}
                                to={`/categoria/${selectedParent.slug}/${child.slug}`}
                                className={styles.child_link}
                            >
                                {child.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
