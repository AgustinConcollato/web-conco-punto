import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClientAuth } from '../../../../context/ClientAuthContext';
import styles from './RegisterPage.module.css';

export function RegisterPage() {
    const { client, register } = useClientAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    if (client) {
        navigate('/', { replace: true });
        return null;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await register({
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim() || undefined,
                password: form.password,
            });
            navigate('/', { replace: true });
        } catch (err) {
            setError(err?.message ?? 'Error al crear la cuenta.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>Crear cuenta</h1>
                <p className={styles.subtitle}>Accedé más rápido en tu próxima compra</p>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <label className={styles.label}>
                        Nombre / Razón social
                        <input
                            className={styles.input}
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            autoFocus
                            autoComplete="name"
                        />
                    </label>

                    <label className={styles.label}>
                        Email
                        <input
                            className={styles.input}
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                        />
                    </label>

                    <label className={styles.label}>
                        Teléfono
                        <input
                            className={styles.input}
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            required
                            autoComplete="tel"
                        />
                    </label>

                    <label className={styles.label}>
                        Contraseña
                        <input
                            className={styles.input}
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            minLength={8}
                            autoComplete="new-password"
                            placeholder="Mín. 8 caracteres"
                        />
                    </label>

                    {error && <p className={styles.error}>{error}</p>}

                    <button className={styles.btn} type="submit" disabled={loading}>
                        {loading ? 'Creando cuenta…' : 'Crear cuenta'}
                    </button>
                </form>

                <p className={styles.hint}>
                    ¿Ya tenés cuenta?{' '}
                    <Link to="/iniciar-sesion" style={{ textDecoration: 'underline' }}>Iniciá sesión</Link>
                </p>
                <Link to="/" className={styles.back}>Ver productos</Link>
            </div>
        </div>
    );
}
