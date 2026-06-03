import styles from './AttributeList.module.css';

export function AttributeList({ attributeValues }) {
    if (!attributeValues?.length) return null;

    const visible = attributeValues.filter(av => av.value && av.value !== 'false');
    if (!visible.length) return null;

    return (
        <dl className={styles.list}>
            {visible.map(av => (
                <div key={av.id ?? av.category_attribute_id} className={styles.row}>
                    <dt className={styles.key}>{av.category_attribute?.name ?? 'Atributo'}</dt>
                    <dd className={styles.val}>
                        {av.category_attribute?.type === 'boolean'
                            ? (av.value === 'true' ? 'Sí' : 'No')
                            : av.value}
                    </dd>
                </div>
            ))}
        </dl>
    );
}
