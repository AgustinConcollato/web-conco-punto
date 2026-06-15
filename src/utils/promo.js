import { formatDate } from './formatDate';

export function getActivePromo(promotions, priceListId) {
    if (!promotions?.length) return null;
    return promotions.find(p => {
        if (!p.price_list_ids?.length) return true;
        return p.price_list_ids.includes(priceListId);
    }) ?? null;
}

export function calcPromoPrice(price, promo) {
    if (!promo || price === null) return null;
    if (promo.discount_type === 'percentage') {
        const discount = price * (promo.discount_value / 100);
        const capped = promo.max_discount_amount
            ? Math.min(discount, promo.max_discount_amount)
            : discount;
        return price - capped;
    }
    if (promo.discount_type === 'fixed_amount') {
        return Math.max(0, price - promo.discount_value);
    }
    if (promo.discount_type === 'second_unit_percentage') {
        const p = Number(price);
        const secondUnit = p * (1 - promo.discount_value / 100);
        return (p + secondUnit) / 2;
    }
    return null;
}

export function promoLabel(promo, formatPriceFn) {
    if (promo.discount_type === 'percentage') return `-${promo.discount_value}%`;
    if (promo.discount_type === 'fixed_amount') return `-${formatPriceFn(promo.discount_value)}`;
    if (promo.discount_type === 'second_unit_percentage') return `2ª unidad -${promo.discount_value}%`;
    return 'Promo';
}

export function promoEndLabel(promo) {
    if (!promo?.ends_at) return null;
    return `Descuento valido hasta ${formatDate(promo.ends_at, 'short')}`;
}

export function promoEndDisplay(promo) {
    if (!promo?.ends_at) return null;
    const end = new Date(promo.ends_at);
    const now = new Date();
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round((endDay - today) / 86400000);
    if (diffDays <= 0) return { text: 'Último día', urgent: true };
    if (diffDays < 5) return { text: `Termina en ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`, urgent: true };
    return { text: `Válido hasta ${formatDate(promo.ends_at, 'short')}`, urgent: false };
}

export function calcEffectivePrice(price, promo, qty) {
    if (!promo || price === null || price === undefined) return price;
    const p = Number(price);
    if (isNaN(p)) return price;
    if (promo.discount_type === 'second_unit_percentage') {
        if (qty < 2) return p;
        const discountedUnit = p * (1 - promo.discount_value / 100);
        const pairs = Math.floor(qty / 2);
        const remainder = qty % 2;
        const total = pairs * (p + discountedUnit) + remainder * p;
        return total / qty;
    }
    if ((promo.min_quantity ?? 1) > qty) return p;
    return calcPromoPrice(p, promo) ?? p;
}
