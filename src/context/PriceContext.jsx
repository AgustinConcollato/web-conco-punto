import { createContext, useContext, useEffect, useState } from 'react';
import { useClientAuth } from './ClientAuthContext';

// Price list IDs: 2 = retail (www.), 3 = wholesale (mayorista.) — determinado por subdominio o cuenta
const PriceContext = createContext(null);

const STORAGE_KEY = 'price_list_id';
const MAYORISTA_HOST = window.location.hostname.startsWith('mayorista.');

export function PriceProvider({ children }) {
    const { client } = useClientAuth();

    const [priceListId, setPriceListId] = useState(() => {
        if (MAYORISTA_HOST) return 3;
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? Number(stored) : 2;
    });

    useEffect(() => {
        if (client?.price_list_id) {
            setPriceListId(client.price_list_id);
        }
    }, [client]);

    const setPriceListIdPersisted = (id) => {
        if (MAYORISTA_HOST) return;
        localStorage.setItem(STORAGE_KEY, id);
        setPriceListId(id);
    };

    return (
        <PriceContext.Provider value={{
            priceListId,
            setPriceListId: setPriceListIdPersisted,
            isLocked: MAYORISTA_HOST
        }}>
            {children}
        </PriceContext.Provider>
    );
}

export function usePriceContext() {
    return useContext(PriceContext);
}

export function getPrice(priceLists, priceListId) {
    const pl = priceLists?.find(pl => pl.id === priceListId);
    return pl?.price ?? pl?.pivot?.price ?? null;
}
