import { API_URL } from '../../../config/api';

export const postWholesaleOrder = (payload) =>
    fetch(`${API_URL}/orders/wholesale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
    }).then(r => r.ok ? r.json() : r.json().then(e => Promise.reject(e)));
