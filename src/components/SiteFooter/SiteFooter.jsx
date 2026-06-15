import { Link } from 'react-router-dom';
import logob from '../../assets/logob.svg';
import { useClientAuth } from '../../context/ClientAuthContext';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
    const { client } = useClientAuth();
    const year = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                <Link to="/" className={styles.brand}>
                    <img src={logob} alt="Logo Conco y Punto" />
                </Link>

                <nav className={styles.col} aria-label="Enlaces">
                    <span className={styles.label}>Enlaces</span>
                    <Link to="/">Inicio</Link>
                    <Link to="/carrito">Carrito</Link>
                    {client ? (
                        <Link to="/perfil">Mi perfil</Link>
                    ) : (
                        <>
                            <Link to="/iniciar-sesion">Iniciar sesión</Link>
                            <Link to="/registro">Crear cuenta</Link>
                        </>
                    )}
                </nav>

                <div className={styles.col}>
                    <span className={styles.label}>Contacto</span>
                    <div className={styles.social}>
                        <a
                            href="https://wa.me/5493492281530"
                            target="_blank"
                            rel="noreferrer"
                            className={styles.social_link}
                            aria-label="WhatsApp"
                        >
                            <i className="hgi hgi-stroke hgi-rounded hgi-whatsapp"></i>
                        </a>
                        <a
                            href="https://www.instagram.com/concoypunto/"
                            target="_blank"
                            rel="noreferrer"
                            className={styles.social_link}
                            aria-label="Instagram"
                        >
                            <i className="hgi hgi-stroke hgi-rounded hgi-instagram"></i>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
