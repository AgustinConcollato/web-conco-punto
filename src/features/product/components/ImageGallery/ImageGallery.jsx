import { useState } from 'react';
import { IMAGE_URL } from '../../../../config/api';
import styles from './ImageGallery.module.css';

export function ImageGallery({ images, alt = '' }) {
    const [active, setActive] = useState(0);

    if (!images?.length) return <div className={styles.empty}>Sin imágenes</div>;

    return (
        <div className={styles.gallery}>
            <div className={styles.main_wrap}>
                <img
                    src={`${IMAGE_URL}/${images[active].path}`}
                    alt={alt}
                    className={styles.main_img}
                />
            </div>
            {images.length > 1 && (
                <div className={styles.thumbs}>
                    {images.map((img, i) => (
                        <button
                            key={img.id}
                            className={`${styles.thumb} ${i === active ? styles.thumb_active : ''}`}
                            onClick={() => setActive(i)}
                            aria-label={`Ver imagen ${i + 1} de ${images.length}`}
                            aria-current={i === active ? 'true' : undefined}
                        >
                            <img src={`${IMAGE_URL}/${img.thumbnail_path}`} alt="" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
