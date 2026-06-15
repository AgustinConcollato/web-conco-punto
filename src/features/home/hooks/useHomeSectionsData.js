import { useEffect, useState } from 'react';
import {
    getNewArrivals,
    getBestSellers,
    getProducts,
    getPublicPromotions,
} from '../../catalog/services/catalogService';

const fetchProductsFor = (settings, priceListId) => {
    const { source, categoryId, keyword, limit } = settings ?? {};

    if (source === 'new-arrivals') return getNewArrivals(priceListId);
    if (source === 'best-sellers') return getBestSellers(priceListId);
    if (source === 'category' && categoryId) {
        return getProducts({
            category_id: categoryId,
            per_page: limit ?? 12,
            price_list_id: priceListId,
        }).then(res => res.data ?? []);
    }
    if (source === 'keyword' && keyword) {
        return getProducts({
            search: keyword,
            per_page: limit ?? 12,
            price_list_id: priceListId,
        }).then(res => res.data ?? []);
    }
    return Promise.resolve([]);
};

/**
 * Junta en un solo Promise.all los datos de todas las secciones visibles,
 * para que el home renderice todo junto. Solo refetchea cuando cambian
 * parámetros que afectan datos (no títulos/textos/banners).
 */
export function useHomeSectionsData(sections, priceListId) {
    const visible = (sections ?? []).filter(s => s.visible);

    const productSections = visible.filter(s => s.type === 'products');
    const needsPromotions = visible.some(s => s.type === 'promotions');

    const fetchKey = JSON.stringify({
        priceListId,
        promos: needsPromotions,
        products: productSections.map(s => [
            s.id,
            s.settings?.source,
            s.settings?.categoryId,
            s.settings?.keyword,
            s.settings?.limit,
        ]),
    });

    const [data, setData] = useState({ ready: false, productsBySection: {}, promotions: [] });

    useEffect(() => {
        if (sections === null) return;

        let cancelled = false;

        const productPromises = productSections.map(s =>
            fetchProductsFor(s.settings, priceListId).catch(() => [])
        );
        const promotionsPromise = needsPromotions
            ? getPublicPromotions(priceListId).catch(() => [])
            : Promise.resolve([]);

        Promise.all([promotionsPromise, ...productPromises]).then(([promotions, ...productLists]) => {
            if (cancelled) return;

            const productsBySection = {};
            productSections.forEach((s, i) => {
                productsBySection[s.id] = productLists[i];
            });

            setData({ ready: true, productsBySection, promotions });
        });

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchKey, sections === null]);

    return data;
}
