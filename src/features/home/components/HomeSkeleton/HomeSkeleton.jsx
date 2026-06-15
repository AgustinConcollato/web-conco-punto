import styles from './HomeSkeleton.module.css';

function ProductsRowSkeleton() {
    return (
        <div className={styles.skel_section}>
            <div className={`${styles.skel} ${styles.skel_title}`} />
            <div className={styles.skel_row}>
                {Array.from({ length: 4 }, (_, j) => (
                    <div key={j} className={styles.skel_card}>
                        <div className={`${styles.skel} ${styles.skel_img}`} />
                        <div className={styles.skel_body}>
                            <div className={`${styles.skel} ${styles.skel_line}`} />
                            <div className={`${styles.skel} ${styles.skel_line_short}`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BannerSkeleton() {
    return <div className={`${styles.skel} ${styles.skel_banner}`} />;
}

function PromotionsSkeleton() {
    return (
        <div className={styles.skel_promo_block}>
            <div className={styles.skel_promo_header}>
                <div className={`${styles.skel} ${styles.skel_title}`} />
                <div className={`${styles.skel} ${styles.skel_badge}`} />
            </div>
            <div className={styles.skel_row}>
                {Array.from({ length: 4 }, (_, j) => (
                    <div key={j} className={styles.skel_card}>
                        <div className={`${styles.skel} ${styles.skel_img}`} />
                        <div className={styles.skel_body}>
                            <div className={`${styles.skel} ${styles.skel_line}`} />
                            <div className={`${styles.skel} ${styles.skel_line_short}`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TextSkeleton() {
    return (
        <div className={styles.skel_text_block}>
            <div className={`${styles.skel} ${styles.skel_title}`} />
            <div className={`${styles.skel} ${styles.skel_line}`} />
        </div>
    );
}

const SKELETONS = {
    banner: BannerSkeleton,
    products: ProductsRowSkeleton,
    promotions: PromotionsSkeleton,
    text: TextSkeleton,
};

export function HomeSkeleton({ sections }) {
    // Layout todavía desconocido: skeleton genérico
    if (!sections) {
        return (
            <div className={styles.skeleton_wrap}>
                {Array.from({ length: 3 }, (_, i) => <ProductsRowSkeleton key={i} />)}
            </div>
        );
    }

    return (
        <div className={styles.skeleton_wrap}>
            {sections
                .filter(s => s.visible && SKELETONS[s.type])
                .map(s => {
                    const Skeleton = SKELETONS[s.type];
                    return <Skeleton key={s.id} />;
                })}
        </div>
    );
}
