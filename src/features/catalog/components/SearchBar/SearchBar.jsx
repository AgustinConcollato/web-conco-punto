import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './SearchBar.module.css';

export function SearchBar() {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const urlQ = searchParams.get('q') ?? '';

    const [value, setValue] = useState(urlQ);

    useEffect(() => {
        setValue(urlQ);
    }, [urlQ]);

    const handleSearch = (q) => {
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        navigate(`/buscar?${params}`, { replace: true });
    };

    return (
        <div className={styles.wrapper}>
            <svg className={styles.icon} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="8.5" cy="8.5" r="5.5" />
                <line x1="13" y1="13" x2="18" y2="18" strokeLinecap="round" />
            </svg>
            <input
                className={styles.input}
                type="search"
                placeholder="Buscar productos…"
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch(e.target.value.trim())}
            />
            <button type="button" onClick={() => handleSearch(value.trim())}>
                <span>Buscar</span>
                <i className="hgi hgi-stroke hgi-rounded hgi-arrow-right-double"></i>
            </button>
        </div>
    );
}
