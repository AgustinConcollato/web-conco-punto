import { IMAGE_URL } from '../../../../config/api';
import styles from './PromoTilesSection.module.css';

export function PromoTilesSection({ tiles }) {
    if (!tiles?.length) return null;

    return (
        <div className={styles.grid}>
            {tiles.map(tile => {
                const src = tile.url ?? `${IMAGE_URL}/${tile.path}`;
                const Tag = tile.link ? 'a' : 'div';

                return (
                    <Tag key={tile.id} href={tile.link || undefined} className={styles.tile}>
                        <div className={styles.text}>
                            {tile.eyebrow && <span className={styles.eyebrow}>{tile.eyebrow}</span>}
                            {tile.title && <h3 className={styles.title}>{tile.title}</h3>}
                            {tile.buttonText && <span className={styles.button}>{tile.buttonText}</span>}
                        </div>
                        <div className={styles.image_wrap} style={{ background: tile.bgColor || undefined }}>
                            <img src={src} alt="" className={styles.image} />
                        </div>
                    </Tag>
                );
            })}
        </div>
    );
}
