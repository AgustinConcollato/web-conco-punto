import { API_URL } from '../../../config/api';

const get = (path) =>
    fetch(`${API_URL}${path}`).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
    });

export const getProducts = (params = {}) => {
    const clean = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );
    return get(`/catalog?${new URLSearchParams(clean)}`);
};

export const getProduct = (id, priceListId) => {
    const qs = priceListId ? `?price_list_id=${priceListId}` : '';
    return get(`/catalog/${id}${qs}`);
};

export const getCategories = () => get('/categories');
