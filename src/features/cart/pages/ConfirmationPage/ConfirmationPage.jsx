import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Seo } from '../../../../components/Seo/Seo';
import styles from './ConfirmationPage.module.css';

export function ConfirmationPage() {
    const [searchParams] = useSearchParams();
    const orderNumber = searchParams.get('number');
    const { state } = useLocation();
    const regResult = state?.registrationResult ?? null;

    return (
        <div className={styles.page}>
            <Seo title="Pedido recibido" noindex />
            <div className={styles.card}>
                <div className={styles.check} aria-hidden="true">✓</div>
                <h1 className={styles.title}>¡Pedido recibido!</h1>
                <p className={styles.body}>
                    Nos contactaremos para coordinar el pago y los detalles del envío.
                </p>
                {orderNumber && (
                    <p className={styles.order_id}>
                        Número de pedido: <strong>#{orderNumber}</strong>
                    </p>
                )}

                {regResult === 'success' && (
                    <div className={styles.register_success}>
                        ¡Cuenta creada! La próxima vez podés ingresar con tu email y contraseña.
                    </div>
                )}

                {regResult && regResult !== 'success' && (
                    <p className={styles.register_error}>
                        No pudimos crear tu cuenta: {regResult} Podés intentarlo desde{' '}
                        <Link to="/registro">la página de registro</Link>.
                    </p>
                )}

                <Link to="/" className={styles.link}>Ver más productos</Link>
            </div>
        </div>
    );
}
