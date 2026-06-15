import styles from './TextBlock.module.css';

export function TextBlock({ settings }) {
    const { title, body } = settings ?? {};
    if (!title && !body) return null;

    return (
        <section className={styles.block}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {body && <p className={styles.body}>{body}</p>}
        </section>
    );
}
