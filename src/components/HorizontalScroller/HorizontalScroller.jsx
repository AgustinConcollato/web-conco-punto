import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './HorizontalScroller.module.css';

export function HorizontalScroller({ children, className }) {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateArrows = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        updateArrows();

        el.addEventListener('scroll', updateArrows, { passive: true });
        window.addEventListener('resize', updateArrows);

        const resizeObserver = new ResizeObserver(updateArrows);
        resizeObserver.observe(el);

        return () => {
            el.removeEventListener('scroll', updateArrows);
            window.removeEventListener('resize', updateArrows);
            resizeObserver.disconnect();
        };
    }, [updateArrows, children]);

    const scroll = (direction) => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
    };

    return (
        <div className={styles.wrap}>
            {canScrollLeft && (
                <button
                    type="button"
                    className={`${styles.arrow} ${styles.arrow_left}`}
                    onClick={() => scroll(-1)}
                    aria-label="Anterior"
                >
                    <i className="hgi hgi-stroke hgi-rounded hgi-arrow-left-02"></i>
                </button>
            )}
            <div ref={scrollRef} className={`${styles.scroll} ${className ?? ''}`}>
                {children}
            </div>
            {canScrollRight && (
                <button
                    type="button"
                    className={`${styles.arrow} ${styles.arrow_right}`}
                    onClick={() => scroll(1)}
                    aria-label="Siguiente"
                >
                    <i className="hgi hgi-stroke hgi-rounded hgi-arrow-right-02"></i>
                </button>
            )}
        </div>
    );
}
