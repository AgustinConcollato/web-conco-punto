import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useClientAuth } from '../../../../context/ClientAuthContext';
import styles from './LoginPage.module.css';

export function LoginPage() {
    const { client, login } = useClientAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    if (client) {
        navigate('/', { replace: true });
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(email.trim(), password);
            navigate('/', { replace: true });
        } catch (err) {
            setError(err?.message ?? 'Error al iniciar sesión.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>Iniciar sesión</h1>
                <p className={styles.subtitle}>Accedé a tu cuenta mayorista</p>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <label className={styles.label}>
                        Email
                        <input
                            className={styles.input}
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoFocus
                            autoComplete="email"
                        />
                    </label>

                    <label className={styles.label}>
                        Contraseña
                        <input
                            className={styles.input}
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </label>

                    {error && <p className={styles.error}>{error}</p>}

                    <button className={styles.btn} type="submit" disabled={loading}>
                        {loading ? 'Ingresando…' : 'Ingresar'}
                    </button>
                </form>

                <p className={styles.hint}>
                    ¿Primera vez?{' '}
                    <Link to="/registro" style={{ textDecoration: 'underline' }}>Creá tu cuenta</Link>
                    {' '}o completá un pedido y al confirmar podés registrarte.
                </p>
                <Link to="/" className={styles.back}>Ver productos</Link>
            </div>
        </div>
    );
}
