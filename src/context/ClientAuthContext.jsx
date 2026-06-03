import { createContext, useContext, useEffect, useState } from 'react';
import { getClientMe, loginClient, logoutClient, registerClient as registerClientApi, registerFromOrder as registerFromOrderApi } from '../services/clientAuthService';
import {
    updateProfile as updateProfileApi,
    createAddress as createAddressApi,
    updateAddress as updateAddressApi,
    deleteAddress as deleteAddressApi,
    setDefaultAddress as setDefaultAddressApi,
} from '../services/addressService';

const ClientAuthContext = createContext(null);

const TOKEN_KEY = 'client_token';
const MAYORISTA_HOST = window.location.hostname.startsWith('mayorista.');

export function ClientAuthProvider({ children }) {
    const [client, setClient] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
    const [loading, setLoading] = useState(!!localStorage.getItem(TOKEN_KEY));

    useEffect(() => {
        if (!token) { setLoading(false); return; }

        getClientMe(token)
            .then(data => {
                applyGuard(data);
                setClient(data);
            })
            .catch(() => clearSession())
            .finally(() => setLoading(false));
    }, []);

    function applyGuard(clientData) {
        if (MAYORISTA_HOST && clientData.price_list_id !== 3) {
            window.location.href = 'https://www.concoypunto.com';
        }
    }

    function saveSession(tok, clientData) {
        localStorage.setItem(TOKEN_KEY, tok);
        setToken(tok);
        setClient(clientData);
    }

    function clearSession() {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setClient(null);
    }

    async function login(email, password) {
        const data = await loginClient({ email, password });
        applyGuard(data.client);
        saveSession(data.token, data.client);
        return data;
    }

    async function logout() {
        try { if (token) await logoutClient(token); } catch { /* token ya inválido */ }
        clearSession();
    }

    async function register({ name, email, phone, password }) {
        const data = await registerClientApi({
            name, email, phone, password,
            price_list_id: MAYORISTA_HOST ? 3 : 2,
        });
        applyGuard(data.client);
        saveSession(data.token, data.client);
        return data;
    }

    async function registerFromOrder(orderId, password) {
        const data = await registerFromOrderApi({ order_id: orderId, password }, token);
        saveSession(data.token, data.client);
        return data;
    }

    async function refreshClient() {
        const data = await getClientMe(token);
        setClient(data);
        return data;
    }

    async function updateProfile({ name, phone }) {
        const data = await updateProfileApi(token, { name, phone });
        setClient(data);
        return data;
    }

    async function addAddress(address) {
        await createAddressApi(token, address);
        return refreshClient();
    }

    async function editAddress(id, address) {
        await updateAddressApi(token, id, address);
        return refreshClient();
    }

    async function removeAddress(id) {
        await deleteAddressApi(token, id);
        return refreshClient();
    }

    async function makeDefaultAddress(id) {
        await setDefaultAddressApi(token, id);
        return refreshClient();
    }

    return (
        <ClientAuthContext.Provider value={{ client, token, loading, login, logout, register, registerFromOrder, updateProfile, addAddress, editAddress, removeAddress, makeDefaultAddress }}>
            {children}
        </ClientAuthContext.Provider>
    );
}

export function useClientAuth() {
    return useContext(ClientAuthContext);
}
