import cardStyles from '../../../catalog/components/ProductCard/ProductCard.module.css';
import styles from './DropshipNotice.module.css';
import img from '../../../../assets/img/autito.webp'

export function DropshipNotice() {
    return (
        <div className={styles.notice}>
            <div className={`${cardStyles.card} ${styles.card}`}>
                <div className={cardStyles.img_wrap}>
                    <img src={img} alt="" className={cardStyles.img} />
                </div>
                <div className={cardStyles.body}>
                    <div className={`${styles.skel} ${styles.skel_name}`} />
                    <div className={cardStyles.info}>
                        <div className={`${styles.skel} ${styles.skel_sku}`} />
                        <p className={`${cardStyles.stock} ${cardStyles.available}`}>Disponible</p>
                    </div>
                    <div className={`${styles.skel} ${styles.skel_price}`} />
                </div>
            </div>
            <div className={styles.text}>
                <p className={styles.text_title}>Productos Disponibles</p>
                <p className={styles.text_body}>
                    Si tu carrito incluye productos <b>disponibles</b>, el tiempo de preparación y entrega es de 3 a 7 días hábiles.
                </p>
            </div>
        </div>
    );
}
