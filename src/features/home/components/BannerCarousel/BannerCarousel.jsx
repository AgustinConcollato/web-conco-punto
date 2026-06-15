import { useEffect, useRef, useState } from 'react';
import { IMAGE_URL } from '../../../../config/api';
import styles from './BannerCarousel.module.css';

export function BannerCarousel({ settings }) {
    const slides = settings?.slides ?? [];
    const autoplayMs = settings?.autoplayMs ?? 5000;
    const [current, setCurrent] = useState(0);
    const pausedRef = useRef(false);

    useEffect(() => {
        if (current >= slides.length) setCurrent(0);
    }, [slides.length, current]);

    useEffect(() => {
        if (slides.length < 2) return;

        const timer = setInterval(() => {
            if (!pausedRef.current) {
                setCurrent(c => (c + 1) % slides.length);
            }
        }, autoplayMs);

        return () => clearInterval(timer);
    }, [slides.length, autoplayMs]);

    if (!slides.length) return null;

    const go = (index) => setCurrent((index + slides.length) % slides.length);

    return (
        <section
            className={styles.carousel}
            onMouseEnter={() => { pausedRef.current = true; }}
            onMouseLeave={() => { pausedRef.current = false; }}
            aria-label="Banners"
        >
            <div
                className={styles.track}
                style={{ transform: `translateX(-${current * 100}%)` }}
            >
                {slides.map(slide => {
                    const src = slide.url ?? `${IMAGE_URL}/${slide.path}`;
                    const img = <img src={src} alt="" className={styles.img} />;

                    return slide.link ? (
                        <a key={slide.id} href={slide.link} className={styles.slide}>
                            {img}
                        </a>
                    ) : (
                        <div key={slide.id} className={styles.slide}>
                            {img}
                        </div>
                    );
                })}
            </div>

            {slides.length > 1 && (
                <>
                    <button
                        className={`${styles.arrow} ${styles.arrow_left}`}
                        onClick={() => go(current - 1)}
                        aria-label="Banner anterior"
                    >
                    <i className="hgi hgi-stroke hgi-rounded hgi-arrow-left-02"></i>
                    </button>
                    <button
                        className={`${styles.arrow} ${styles.arrow_right}`}
                        onClick={() => go(current + 1)}
                        aria-label="Banner siguiente"
                    >
                        <i className="hgi hgi-stroke hgi-rounded hgi-arrow-right-02"></i>
                    </button>

                    <div className={styles.dots}>
                        {slides.map((slide, i) => (
                            <button
                                key={slide.id}
                                className={`${styles.dot} ${i === current ? styles.dot_active : ''}`}
                                onClick={() => go(i)}
                                aria-label={`Ir al banner ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
