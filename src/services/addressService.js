import { API_URL } from '../config/api';

const headers = (token) => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const handle = (r) => r.ok ? r.json() : r.json().then(e => Promise.reject(e));

export const updateProfile = (token, { name, phone }) =>
    fetch(`${API_URL}/client/me`, {
        method: 'PUT',
        headers: headers(token),
        body: JSON.stringify({ name, phone }),
    }).then(handle);

export const getAddresses = (token) =>
    fetch(`${API_URL}/client/addresses`, {
        headers: headers(token),
    }).then(handle);

export const createAddress = (token, address) =>
    fetch(`${API_URL}/client/addresses`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify(address),
    }).then(handle);

export const updateAddress = (token, id, address) =>
    fetch(`${API_URL}/client/addresses/${id}`, {
        method: 'PUT',
        headers: headers(token),
        body: JSON.stringify(address),
    }).then(handle);

export const deleteAddress = (token, id) =>
    fetch(`${API_URL}/client/addresses/${id}`, {
        method: 'DELETE',
        headers: headers(token),
    }).then(handle);

export const setDefaultAddress = (token, id) =>
    fetch(`${API_URL}/client/addresses/${id}/default`, {
        method: 'PUT',
        headers: headers(token),
    }).then(handle);
