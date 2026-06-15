import { createContext, useContext, useState } from 'react';
import { calcEffectivePrice } from '../utils/promo';

const CartContext = createContext(null);

const STORAGE_KEY = 'mayorista_cart';

function loadCart() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveCart(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function isSameItem(a, b) {
    return a.product_id === b.product_id && (a.variant_id ?? null) === (b.variant_id ?? null);
}

export function CartProvider({ children }) {
    const [items, setItems] = useState(loadCart);
    const [lastAdded, setLastAdded] = useState(null);

    const persist = (next) => {
        saveCart(next);
        setItems(next);
    };

    const addItem = (item) => {
        let addedQty = 0;
        setItems(prev => {
            const idx = prev.findIndex(i => isSameItem(i, item));
            let next;
            if (idx >= 0) {
                const cap = item.stock ?? prev[idx].stock ?? Infinity;
                const newQty = Math.min(prev[idx].qty + item.qty, cap);
                addedQty = newQty - prev[idx].qty;
                next = prev.map((i, k) => k === idx ? { ...i, qty: newQty, stock: item.stock ?? i.stock } : i);
            } else {
                const cap = item.stock ?? Infinity;
                const newQty = Math.min(item.qty, cap);
                addedQty = newQty;
                next = [...prev, { ...item, qty: newQty }];
            }
            saveCart(next);
            return next;
        });
        if (addedQty > 0) {
            setLastAdded(prev => (prev && isSameItem(prev, item)) ? { ...item, qty: prev.qty + addedQty } : { ...item, qty: addedQty });
        }
        return addedQty;
    };

    const clearLastAdded = () => setLastAdded(null);

    const removeItem = (product_id, variant_id) => {
        const next = items.filter(i => !isSameItem(i, { product_id, variant_id: variant_id ?? null }));
        persist(next);
    };

    const updateQty = (product_id, variant_id, qty) => {
        if (qty < 1) return;
        const next = items.map(i => {
            if (!isSameItem(i, { product_id, variant_id: variant_id ?? null })) return i;
            const cap = i.stock ?? Infinity;
            return { ...i, qty: Math.min(qty, cap) };
        });
        persist(next);
    };

    const clearCart = () => persist([]);

    // Sincroniza stocks y cantidades en un solo persist. Devuelve los cambios detectados.
    // stockMap: Map<"product_id:variant_id", currentStock>
    const syncCartStocks = (stockMap) => {
        const changes = [];
        const next = [];
        for (const item of items) {
            const key = `${item.product_id}:${item.variant_id ?? null}`;
            const currentStock = stockMap.has(key) ? stockMap.get(key) : (item.stock ?? Infinity);
            if (currentStock === 0) {
                changes.push({ type: 'removed', name: item.name, sku: item.sku ?? null });
            } else if (currentStock < item.qty) {
                changes.push({ type: 'reduced', name: item.name, sku: item.sku ?? null, from: item.qty, to: currentStock });
                next.push({ ...item, stock: currentStock, qty: currentStock });
            } else {
                next.push({ ...item, stock: currentStock });
            }
        }
        persist(next);
        return changes;
    };

    const itemCount = items.reduce((acc, i) => acc + i.qty, 0);
    const cartTotal = items.reduce((acc, i) => acc + calcEffectivePrice(i.price, i.promo ?? null, i.qty) * i.qty, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQty, syncCartStocks, clearCart, itemCount, cartTotal, lastAdded, clearLastAdded }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCartContext() {
    return useContext(CartContext);
}
