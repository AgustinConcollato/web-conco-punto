// Fallback si la API de layout falla o devuelve vacío: equivale al home original
export const DEFAULT_SECTIONS = [
    {
        id: 'default-new-arrivals',
        type: 'products',
        visible: true,
        settings: {
            title: 'Ingresos',
            source: 'new-arrivals',
            categoryId: null,
            viewAllHref: '/ingresos',
            limit: 12,
        },
    },
    {
        id: 'default-promotions',
        type: 'promotions',
        visible: true,
        settings: { title: '' },
    },
    {
        id: 'default-best-sellers',
        type: 'products',
        visible: true,
        settings: {
            title: 'Más vendidos',
            source: 'best-sellers',
            categoryId: null,
            viewAllHref: null,
            limit: 12,
        },
    },
];
