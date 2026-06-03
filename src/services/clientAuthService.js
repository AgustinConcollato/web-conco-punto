import { API_URL } from '../config/api';

const headers = (token) => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const handle = (r) => r.ok ? r.json() : r.json().then(e => Promise.reject(e));

export const loginClient = ({ email, password }) =>
    fetch(`${API_URL}/client/login`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email, password }),
    }).then(handle);

export const logoutClient = (token) =>
    fetch(`${API_URL}/client/logout`, {
        method: 'POST',
        headers: headers(token),
    }).then(handle);

export const getClientMe = (token) =>
    fetch(`${API_URL}/client/me`, {
        headers: headers(token),
    }).then(handle);

export const registerClient = ({ name, email, phone, password, price_list_id }) =>
    fetch(`${API_URL}/client/register`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ name, email, phone, password, price_list_id }),
    }).then(handle);

export const registerFromOrder = ({ order_id, password }, token = null) =>
    fetch(`${API_URL}/client/register-from-order`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify({ order_id, password }),
    }).then(handle);
