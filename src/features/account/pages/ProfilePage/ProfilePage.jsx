import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useClientAuth } from '../../../../context/ClientAuthContext';
import { PROVINCES } from '../../../../utils/provinces';
import { Seo } from '../../../../components/Seo/Seo';
import styles from './ProfilePage.module.css';

const EMPTY_ADDRESS = {
    label: '',
    street: '',
    street_number: '',
    locality: '',
    province: '',
    postal_code: '',
};

export function ProfilePage() {
    const { client, loading, updateProfile, addAddress, editAddress, removeAddress, makeDefaultAddress } = useClientAuth();

    const [data, setData] = useState({ name: '', phone: '' });
    const [savingData, setSavingData] = useState(false);
    const [dataMsg, setDataMsg] = useState(null);

    const [addr, setAddr] = useState(EMPTY_ADDRESS);
    const [editingId, setEditingId] = useState(null);
    const [savingAddr, setSavingAddr] = useState(false);
    const [addrError, setAddrError] = useState(null);

    useEffect(() => {
        if (client) setData({ name: client.name ?? '', phone: client.phone ?? '' });
    }, [client]);

    if (loading) return null;
    if (!client) return <Navigate to="/iniciar-sesion" replace />;

    const addresses = client.addresses ?? [];

    const handleDataChange = (e) => {
        setDataMsg(null);
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const remove = (id) => {
        setEditingId(null);
        removeAddress(id);
    }

    const submitData = async (e) => {
        e.preventDefault();
        setSavingData(true);
        setDataMsg(null);
        try {
            await updateProfile({ name: data.name.trim(), phone: data.phone.trim() });
            setDataMsg('Datos actualizados.');
        } catch (err) {
            setDataMsg(err?.message ?? 'Error al guardar.');
        } finally {
            setSavingData(false);
        }
    };

    const handleAddrChange = (e) => {
        setAddrError(null);
        const { name, value } = e.target;
        setAddr(prev => ({ ...prev, [name]: value }));
    };

    const startEdit = (a) => {
        setEditingId(a.id);
        setAddr({
            label: a.label ?? '',
            street: a.street ?? '',
            street_number: a.street_number ?? '',
            locality: a.locality ?? '',
            province: a.province ?? '',
            postal_code: a.postal_code ?? '',
        });
        setAddrError(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setAddr(EMPTY_ADDRESS);
        setAddrError(null);
    };

    const submitAddr = async (e) => {
        e.preventDefault();
        setSavingAddr(true);
        setAddrError(null);
        try {
            const payload = {
                label: addr.label.trim() || null,
                street: addr.street.trim(),
                street_number: addr.street_number.trim(),
                locality: addr.locality.trim(),
                province: addr.province,
                postal_code: addr.postal_code.trim(),
            };
            if (editingId) {
                await editAddress(editingId, payload);
            } else {
                await addAddress(payload);
            }
            cancelEdit();
        } catch (err) {
            setAddrError(err?.message ?? 'Error al guardar la dirección.');
        } finally {
            setSavingAddr(false);
        }
    };

    return (
        <div className={styles.page}>
            <Seo title="Mi perfil" noindex />
            <Link to="/" className={styles.back}>← Volver</Link>
            <h1 className={styles.title}>Mi perfil</h1>

            <section className={styles.section}>
                <h2 className={styles.section_title}>Datos personales</h2>
                <form className={styles.form} onSubmit={submitData}>
                    <label className={styles.label}>
                        Nombre y Apellido / Razón social
                        <input className={styles.input} name="name" value={data.name} onChange={handleDataChange} required />
                    </label>
                    <label className={styles.label}>
                        Email
                        <input className={styles.input} value={client.email} disabled />
                    </label>
                    <label className={styles.label}>
                        Teléfono
                        <input className={styles.input} type="tel" name="phone" value={data.phone} onChange={handleDataChange} required />
                    </label>
                    {dataMsg && <p className={styles.msg}>{dataMsg}</p>}
                    <button className={styles.btn} type="submit" disabled={savingData}>
                        {savingData ? 'Guardando…' : 'Guardar cambios'}
                    </button>
                </form>
            </section>

            <section className={styles.section}>
                <h2 className={styles.section_title}>Direcciones</h2>

                {addresses.length === 0 ? (
                    <p className={styles.empty}>No tenés direcciones guardadas.</p>
                ) : (
                    <ul className={styles.addr_list}>
                        {addresses.map(a => (
                            <li key={a.id} className={styles.addr_item}>
                                <div className={styles.addr_info}>
                                    {a.is_default && <span className={styles.badge}>Predeterminada</span>}
                                    {a.label && <span className={styles.addr_label}>{a.label}</span>}
                                    <p className={styles.addr_text}>
                                        {a.street} {a.street_number}, {a.locality}, {a.province} ({a.postal_code})
                                    </p>
                                </div>
                                <div className={styles.addr_actions}>
                                    {!a.is_default && (
                                        <button className={styles.link_btn} onClick={() => makeDefaultAddress(a.id)}>
                                            Predeterminada
                                        </button>
                                    )}
                                    <button className={styles.link_btn} onClick={() => startEdit(a)}>Editar</button>
                                    <button className={styles.link_btn} onClick={() => remove(a.id)}>Eliminar</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                <form className={styles.form} onSubmit={submitAddr}>
                    <h3 className={styles.form_subtitle}>{editingId ? 'Editar dirección' : 'Agregar dirección'}</h3>
                    {/* <label className={styles.label}>
                        Etiqueta <span className={styles.optional}>(opcional)</span>
                        <input className={styles.input} name="label" value={addr.label} onChange={handleAddrChange} placeholder="Casa, Trabajo…" />
                    </label> */}
                    <div className={styles.row}>
                        <label className={`${styles.label} ${styles.grow}`}>
                            Calle
                            <input className={styles.input} name="street" value={addr.street} onChange={handleAddrChange} required />
                        </label>
                        <label className={`${styles.label} ${styles.fixed}`}>
                            Número
                            <input className={styles.input} name="street_number" value={addr.street_number} onChange={handleAddrChange} required />
                        </label>
                    </div>
                    <label className={styles.label}>
                        Localidad
                        <input className={styles.input} name="locality" value={addr.locality} onChange={handleAddrChange} required />
                    </label>
                    <div className={styles.row}>
                        <label className={`${styles.label} ${styles.grow}`}>
                            Provincia
                            <select className={styles.input} name="province" value={addr.province} onChange={handleAddrChange} required>
                                <option value="">Seleccioná una provincia</option>
                                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </label>
                        <label className={`${styles.label} ${styles.fixed}`}>
                            Código postal
                            <input className={styles.input} name="postal_code" value={addr.postal_code} onChange={handleAddrChange} required inputMode="numeric" maxLength={10} />
                        </label>
                    </div>
                    {addrError && <p className={styles.msg}>{addrError}</p>}
                    <div className={styles.form_actions}>
                        <button className={styles.btn} type="submit" disabled={savingAddr}>
                            {savingAddr ? 'Guardando…' : (editingId ? 'Guardar dirección' : 'Agregar dirección')}
                        </button>
                        {editingId && (
                            <button type="button" className={styles.btn_ghost} onClick={cancelEdit}>Cancelar</button>
                        )}
                    </div>
                </form>
            </section>
        </div>
    );
}
