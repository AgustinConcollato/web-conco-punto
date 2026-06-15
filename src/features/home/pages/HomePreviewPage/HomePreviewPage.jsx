import { useEffect, useState } from 'react';
import { SectionRenderer } from '../../components/SectionRenderer/SectionRenderer';
import { HomeSkeleton } from '../../components/HomeSkeleton/HomeSkeleton';
import { useHomeSectionsData } from '../../hooks/useHomeSectionsData';
import { Seo } from '../../../../components/Seo/Seo';
import styles from './HomePreviewPage.module.css';

const PANEL_ORIGIN = import.meta.env.VITE_PANEL_ORIGIN;

export function HomePreviewPage() {
    const [config, setConfig] = useState(null);
    const data = useHomeSectionsData(config?.sections ?? null, config?.priceListId);

    useEffect(() => {
        const onMessage = (event) => {
            if (event.origin !== PANEL_ORIGIN) return;
            if (event.data?.type !== 'HOME_PREVIEW_CONFIG') return;

            const { sections, priceListId } = event.data.payload ?? {};
            setConfig({ sections: sections ?? [], priceListId: priceListId ?? null });
        };

        window.addEventListener('message', onMessage);
        window.parent.postMessage({ type: 'HOME_PREVIEW_READY' }, PANEL_ORIGIN);

        return () => window.removeEventListener('message', onMessage);
    }, []);

    if (!config) {
        return (
            <div className={styles.waiting}>
                <Seo title="Vista previa" noindex />
                <p>Esperando configuración…</p>
            </div>
        );
    }

    if (!data.ready) {
        return (
            <div className={styles.page}>
                <Seo title="Vista previa" noindex />
                <HomeSkeleton sections={config.sections} />
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <Seo title="Vista previa" noindex />
            <SectionRenderer sections={config.sections} data={data} />
        </div>
    );
}
