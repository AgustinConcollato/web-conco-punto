import { useEffect, useState } from 'react';
import { usePriceContext } from '../../../../context/PriceContext';
import { getHomeLayout } from '../../../catalog/services/catalogService';
import { SectionRenderer } from '../../components/SectionRenderer/SectionRenderer';
import { HomeSkeleton } from '../../components/HomeSkeleton/HomeSkeleton';
import { useHomeSectionsData } from '../../hooks/useHomeSectionsData';
import { DEFAULT_SECTIONS } from '../../constants/defaultSections';
import styles from './HomePage.module.css';

export function HomePage() {
    const { priceListId } = usePriceContext();

    const [sections, setSections] = useState(null);
    const data = useHomeSectionsData(sections, priceListId);

    useEffect(() => {
        let cancelled = false;

        getHomeLayout()
            .then(layout => {
                if (cancelled) return;
                const list = layout?.sections;
                setSections(list?.length ? list : DEFAULT_SECTIONS);
            })
            .catch(() => {
                if (!cancelled) setSections(DEFAULT_SECTIONS);
            });

        return () => { cancelled = true; };
    }, []);

    const loading = sections === null || !data.ready;

    return (
        <div className={styles.page}>
            {loading ? (
                <HomeSkeleton sections={sections} />
            ) : (
                <SectionRenderer sections={sections} data={data} />
            )}
        </div>
    );
}
