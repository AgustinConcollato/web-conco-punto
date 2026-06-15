import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartContext } from '../../../../context/CartContext';
import { useClientAuth } from '../../../../context/ClientAuthContext';
import { formatPrice } from '../../../../utils/formatPrice';
import { PROVINCES } from '../../../../utils/provinces';
import { postWholesaleOrder } from '../../services/checkoutService';
import { calcEffectivePrice } from '../../../../utils/promo';
import { Seo } from '../../../../components/Seo/Seo';
import styles from './CheckoutPage.module.css';

const PREFILL_KEY = 'mayorista_checkout_info';

function loadPrefill() {
    try {
        const raw = localStorage.getItem(PREFILL_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function addressToShipping(a) {
    return {
        street: a.street,
        street_number: a.street_number,
        floor: a.floor ?? '',
        apartment: a.apartment ?? '',
        locality: a.locality,
        province: a.province,
        postal_code: a.postal_code,
    };
}

export function CheckoutPage() {
    const { items, cartTotal, clearCart, syncCartStocks } = useCartContext();
    const { client, registerFromOrder, addAddress } = useClientAuth();
    const navigate = useNavigate();

    const isLogged = !!client;
    const savedAddresses = client?.addresses ?? [];
    const hasSavedAddresses = isLogged && savedAddresses.length > 0;

    const prefill = loadPrefill();
    const [form, setForm] = useState({
        name: client?.name ?? prefill.name ?? '',
        email: client?.email ?? prefill.email ?? '',
        phone: client?.phone ?? prefill.phone ?? '',
        shipping_address: {
            street: prefill.shipping_address?.street ?? '',
            street_number: prefill.shipping_address?.street_number ?? '',
            floor: prefill.shipping_address?.floor ?? '',
            apartment: prefill.shipping_address?.apartment ?? '',
            locality: prefill.shipping_address?.locality ?? '',
            province: prefill.shipping_address?.province ?? '',
            postal_code: prefill.shipping_address?.postal_code ?? '',
        },
        notes: '',
        password: '',
    });
    const [selectedAddressId, setSelectedAddressId] = useState(
        () => (savedAddresses.find(a => a.is_default) ?? savedAddresses[0])?.id ?? null
    );
    const [saveAddress, setSaveAddress] = useState(true);
    const [deliveryMethod, setDeliveryMethod] = useState('shipping');
    const [submitting, setSubmitting] = useState(false);
    const [apiErrors, setApiErrors] = useState(null);
    const [stockChanges, setStockChanges] = useState([]);
    const [generalError, setGeneralError] = useState(null);
    const submittedRef = useRef(false);

    useEffect(() => {
        if (!submittedRef.current && items.length === 0) navigate('/carrito', { replace: true });
    }, [items, navigate]);

    const handleChange = (e) => {
        setApiErrors(null);
        setGeneralError(null);
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = (e) => {
        setApiErrors(null);
        setGeneralError(null);
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, shipping_address: { ...prev.shipping_address, [name]: value } }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiErrors(null);
        setGeneralError(null);
        setStockChanges([]);
        setSubmitting(true);

        const isWhatsapp = deliveryMethod === 'whatsapp';
        const useSaved = hasSavedAddresses && !isWhatsapp;
        const selected = useSaved
            ? (savedAddresses.find(a => a.id === selectedAddressId) ?? savedAddresses[0])
            : null;
        const shipping = isWhatsapp
            ? null
            : (selected ? addressToShipping(selected) : form.shipping_address);

        const payload = {
            name: isLogged ? client.name : form.name.trim(),
            email: isLogged ? client.email : form.email.trim(),
            phone: isLogged ? client.phone : (form.phone.trim() || null),
            delivery_method: deliveryMethod,
            shipping_address: shipping,
            notes: form.notes.trim() || null,
            items: items.map(i => ({
                product_id: i.product_id,
                variant_id: i.variant_id ?? null,
                quantity: i.qty,
            })),
        };

        try {
            const { order_id } = await postWholesaleOrder(payload);

            if (!isLogged) {
                localStorage.setItem(PREFILL_KEY, JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    shipping_address: form.shipping_address,
                }));
            }

            submittedRef.current = true;
            clearCart();

            // Cliente logueado sin direcciones guardadas: guardar la usada en su perfil
            if (isLogged && !hasSavedAddresses && saveAddress && !isWhatsapp && shipping) {
                try { await addAddress(shipping); } catch { /* no bloquear confirmación */ }
            }

            let registrationResult = null;
            if (!isLogged && form.password) {
                try {
                    await registerFromOrder(order_id, form.password);
                    registrationResult = 'success';
                } catch (err) {
                    registrationResult = err?.message ?? 'Error al crear la cuenta.';
                }
            }

            navigate(`/pedido-confirmado?order=${order_id}`, { replace: true, state: { registrationResult } });
        } catch (err) {
            if (Array.isArray(err?.stock_errors)) {
                const stockMap = new Map(
                    err.stock_errors.map(se => [`${se.product_id}:${se.variant_id ?? null}`, se.available])
                );
                const changes = syncCartStocks(stockMap);
                if (items.length - changes.filter(c => c.type === 'removed').length <= 0) {
                    navigate('/carrito', { replace: true });
                } else {
                    setStockChanges(changes);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } else if (err?.errors) {
                setApiErrors(err.errors);
            } else {
                setGeneralError(err?.message ?? 'No pudimos procesar el pedido. Intentá de nuevo.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const addrErr = (field) => apiErrors?.[`shipping_address.${field}`]?.[0];

    return (
        <div className={styles.page}>
            <Seo title="Finalizar pedido" noindex />
            <Link to="/carrito" className={styles.back}>← Volver al carrito</Link>
            <h1 className={styles.title}>Finalizar pedido</h1>

            {stockChanges.length > 0 && (
                <div className={styles.sync_banner}>
                    <div className={styles.sync_banner_header}>
                        <span className={styles.sync_banner_title}>Actualizamos tu carrito</span>
                        <button type="button" className={styles.sync_dismiss} onClick={() => setStockChanges([])} aria-label="Cerrar">×</button>
                    </div>
                    <ul className={styles.sync_list}>
                        {stockChanges.map((c, i) => (
                            <li key={i}>
                                {c.type === 'removed'
                                    ? <><strong>"{c.name}{c.sku ? ` · ${c.sku}` : ''}"</strong> ya no tiene stock y fue eliminado.</>
                                    : <><strong>"{c.name}{c.sku ? ` · ${c.sku}` : ''}"</strong> se redujo de {c.from} a {c.to} unidades.</>
                                }
                            </li>
                        ))}
                    </ul>
                    <p className={styles.sync_hint}>Revisá el resumen y volvé a confirmar el pedido.</p>
                </div>
            )}

            {generalError && <p className={styles.general_error}>{generalError}</p>}

            <div className={styles.layout}>
                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                    <div className={styles.fieldset}>
                        <span className={styles.legend}>Tus datos</span>

                        {isLogged ? (
                            <div className={styles.summary_box}>
                                <p className={styles.summary_line}><strong>{client.name}</strong></p>
                                <p className={styles.summary_line}>{client.email}</p>
                                <p className={styles.summary_line}>{client.phone}</p>
                                <Link to="/perfil" className={styles.edit_link}>Editar en perfil</Link>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className={styles.label}>
                                        Nombre y Apellido / Razón social
                                        <input
                                            className={styles.input}
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            required
                                            autoComplete="off"
                                        />
                                    </label>
                                    {apiErrors?.name && <p className={styles.api_error}>{apiErrors.name}</p>}
                                </div>

                                <div>
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
                                    {apiErrors?.email && <p className={styles.api_error}>{apiErrors.email}</p>}
                                </div>

                                <div>
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
                                    {apiErrors?.phone && <p className={styles.api_error}>{apiErrors.phone}</p>}
                                </div>
                            </>
                        )}
                    </div>

                    <div className={styles.fieldset}>
                        <span className={styles.legend}>Entrega</span>

                        <div className={styles.method_choices}>
                            <label className={styles.method_choice}>
                                <input
                                    type="radio"
                                    name="delivery_method"
                                    checked={deliveryMethod === 'shipping'}
                                    onChange={() => setDeliveryMethod('shipping')}
                                />
                                <span>Envío a domicilio</span>
                            </label>
                            <label className={styles.method_choice}>
                                <input
                                    type="radio"
                                    name="delivery_method"
                                    checked={deliveryMethod === 'whatsapp'}
                                    onChange={() => setDeliveryMethod('whatsapp')}
                                />
                                <span>Coordinar por WhatsApp</span>
                            </label>
                        </div>

                        {deliveryMethod === 'whatsapp' ? (
                            <p className={styles.wa_hint}>Nos comunicamos por WhatsApp para coordinar el envío o el retiro del pedido.</p>
                        ) : hasSavedAddresses ? (
                            <>
                                <span className={styles.legend}>dirección</span>

                                <ul className={styles.addr_choices}>
                                    {savedAddresses.map(a => (
                                        <li key={a.id}>
                                            <label className={styles.addr_choice}>
                                                <input
                                                    type="radio"
                                                    name="address_choice"
                                                    checked={selectedAddressId === a.id}
                                                    onChange={() => setSelectedAddressId(a.id)}
                                                />
                                                <span className={styles.addr_choice_text}>
                                                    {a.label && <strong>{a.label} · </strong>}
                                                    {a.street} {a.street_number}, {a.locality}, {a.province} ({a.postal_code})
                                                    {a.is_default && <span className={styles.addr_default}> · Predeterminada</span>}
                                                </span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/perfil" className={styles.edit_link}>Administrar direcciones</Link>
                            </>
                        ) : (
                            <>
                                <span className={styles.legend}>dirección</span>

                                <div className={styles.form_row}>
                                    <div className={styles.form_col_grow}>
                                        <label className={styles.label}>
                                            Calle
                                            <input
                                                className={styles.input}
                                                name="street"
                                                value={form.shipping_address.street}
                                                onChange={handleAddressChange}
                                                required
                                                autoComplete="address-line1"
                                            />
                                        </label>
                                        {addrErr('street') && <p className={styles.api_error}>{addrErr('street')}</p>}
                                    </div>
                                    <div className={styles.form_col_fixed}>
                                        <label className={styles.label}>
                                            <span className={styles.label_row}>
                                                Número
                                                <span className={styles.tooltip}>
                                                    <i className="hgi hgi-stroke hgi-rounded hgi-alert-circle"></i>
                                                    <span className={styles.tooltip_text}>Si la dirección no tiene número, ingresá 0.</span>
                                                </span>
                                            </span>
                                            <input
                                                className={styles.input}
                                                name="street_number"
                                                value={form.shipping_address.street_number}
                                                onChange={handleAddressChange}
                                                required
                                            />
                                        </label>
                                        {addrErr('street_number') && <p className={styles.api_error}>{addrErr('street_number')}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className={styles.label}>
                                        Localidad
                                        <input
                                            className={styles.input}
                                            name="locality"
                                            value={form.shipping_address.locality}
                                            onChange={handleAddressChange}
                                            required
                                            autoComplete="address-level2"
                                        />
                                    </label>
                                    {addrErr('locality') && <p className={styles.api_error}>{addrErr('locality')}</p>}
                                </div>

                                <div className={styles.form_row}>
                                    <div className={styles.form_col_grow}>
                                        <label className={styles.label}>
                                            Provincia
                                            <select
                                                className={styles.input}
                                                name="province"
                                                value={form.shipping_address.province}
                                                onChange={handleAddressChange}
                                                required
                                            >
                                                <option value="">Seleccioná una provincia</option>
                                                {PROVINCES.map(p => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                        </label>
                                        {addrErr('province') && <p className={styles.api_error}>{addrErr('province')}</p>}
                                    </div>
                                    <div className={styles.form_col_fixed}>
                                        <label className={styles.label}>
                                            Código postal
                                            <input
                                                className={styles.input}
                                                name="postal_code"
                                                value={form.shipping_address.postal_code}
                                                onChange={handleAddressChange}
                                                required
                                                inputMode="numeric"
                                                maxLength={10}
                                            />
                                        </label>
                                        {addrErr('postal_code') && <p className={styles.api_error}>{addrErr('postal_code')}</p>}
                                    </div>
                                </div>

                                {isLogged && (
                                    <label className={styles.checkbox_label}>
                                        <input
                                            type="checkbox"
                                            checked={saveAddress}
                                            onChange={(e) => setSaveAddress(e.target.checked)}
                                        />
                                        Guardar en mi perfil
                                    </label>
                                )}
                            </>
                        )}

                    </div>

                    <div className={styles.fieldset}>
                        <span className={styles.legend}>Nota / Aclaración para el pedido</span>

                        <label className={styles.label}>
                            <span className={styles.optional}>(opcional)</span>
                            <textarea
                                className={`${styles.input} ${styles.textarea}`}
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                rows={2}
                                placeholder="Indicaciones adicionales para el pedido"
                                autoComplete='off'
                            />
                        </label>
                    </div>

                    {!isLogged && (
                        <div className={styles.fieldset}>
                            <span className={styles.legend}>Contraseña</span>

                            <label className={styles.label}>
                                Se crea una cuenta al completar este campo (opcional)
                                <input
                                    className={styles.input}
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    minLength={8}
                                    autoComplete="new-password"
                                    placeholder="Mín. 8 caracteres"
                                />
                            </label>
                        </div>
                    )}

                    <button className={styles.submit_btn} type="submit" disabled={submitting}>
                        {submitting ? 'Enviando...' : 'Confirmar pedido'}
                    </button>
                </form>

                <div className={styles.order_summary}>
                    <h2 className={styles.summary_title}>Resumen</h2>
                    <ul className={styles.summary_list}>
                        {items.map(item => {
                            const effPrice = calcEffectivePrice(item.price, item.promo ?? null, item.qty);
                            return (
                                <li key={`${item.product_id}-${item.variant_id ?? 'base'}`} className={styles.summary_item}>
                                    <span className={styles.summary_name}>
                                        {item.name}
                                        {item.sku && <span className={styles.summary_sku}> · {item.sku}</span>}
                                    </span>
                                    <span className={styles.summary_qty}>×{item.qty}</span>
                                    <span className={styles.summary_price}>{formatPrice(effPrice * item.qty)}</span>
                                </li>
                            );
                        })}
                    </ul>
                    <div className={styles.summary_total}>
                        <span>Total</span>
                        <strong>{formatPrice(cartTotal)}</strong>
                    </div>
                </div>
            </div >
        </div >
    );
}
