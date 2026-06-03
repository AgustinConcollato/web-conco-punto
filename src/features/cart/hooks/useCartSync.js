import { useEffect, useRef, useState } from 'react';
import { getProduct } from '../../catalog/services/catalogService';

export function useCartSync({ items, syncCartStocks }) {
    const [syncing, setSyncing] = useState(false);
    const [changes, setChanges] = useState([]);
    const ran = useRef(false);

    useEffect(() => {
        if (ran.current || items.length === 0) return;
        ran.current = true;

        const uniqueProductIds = [...new Set(items.map(i => i.product_id))];

        setSyncing(true);

        Promise.allSettled(
            uniqueProductIds.map(id => getProduct(id).then(data => ({ id, data })))
        ).then(results => {
            const productMap = {};
            results.forEach(r => {
                if (r.status === 'fulfilled') {
                    const { id, data } = r.value;
                    productMap[id] = data?.error ? null : data;
                }
            });

            const stockMap = new Map(
                items.map(item => {
                    const product = productMap[item.product_id] ?? null;
                    let currentStock = 0;
                    if (product) {
                        if (item.variant_id != null) {
                            const variant = product.variants?.find(
                                v => String(v.id) === String(item.variant_id) && v.is_active
                            );
                            currentStock = variant?.stock ?? 0;
                        } else {
                            currentStock = product.stock ?? 0;
                        }
                    }
                    return [`${item.product_id}:${item.variant_id ?? null}`, currentStock];
                })
            );

            const detected = syncCartStocks(stockMap);
            setChanges(detected);
        }).finally(() => {
            setSyncing(false);
        });
    }, [items, syncCartStocks]);

    return { syncing, changes };
}
