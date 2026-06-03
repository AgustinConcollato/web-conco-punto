import styles from './CategoryFilter.module.css';

export function CategoryFilter({ categories, selectedId, onSelect }) {
    return (
        <div className={styles.filter}>
            <button
                className={`${styles.chip} ${!selectedId ? styles.active : ''}`}
                onClick={() => onSelect(null)}
                aria-pressed={!selectedId}
            >
                Todos
            </button>
            {categories.map(cat => (
                <button
                    key={cat.id}
                    className={`${styles.chip} ${selectedId === cat.id ? styles.active : ''}`}
                    onClick={() => onSelect(cat.id === selectedId ? null : cat.id)}
                    aria-pressed={selectedId === cat.id}
                >
                    {cat.name}
                </button>
            ))}
        </div>
    );
}
