import { useEffect, useState } from 'react';
import { usePriceContext } from '../../../../context/PriceContext';
import { getHomeLayout } from '../../../catalog/services/catalogService';
import { SITE_URL, absoluteUrl } from '../../../../config/api';
import { Seo } from '../../../../components/Seo/Seo';
import { JsonLd } from '../../../../components/Seo/JsonLd';
import { SectionRenderer } from '../../components/SectionRenderer/SectionRenderer';
import { HomeSkeleton } from '../../components/HomeSkeleton/HomeSkeleton';
import { useHomeSectionsData } from '../../hooks/useHomeSectionsData';
import { DEFAULT_SECTIONS } from '../../constants/defaultSections';
import styles from './HomePage.module.css';

const ORGANIZATION_LD = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Conco y Punto',
    url: SITE_URL,
    logo: absoluteUrl('/favicon.svg'),
    sameAs: ['https://www.instagram.com/concoypunto/'],
};

const WEBSITE_LD = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Conco y Punto',
    url: SITE_URL,
    potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/buscar?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
    },
};

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
            <Seo
                title="Tienda online — mayorista"
                description="Comprá online en Conco y Punto. Amplio catálogo con precios mayoristas, promociones y ofertas."
                canonical={SITE_URL}
                image={absoluteUrl('/og-default.jpg')}
            />
            <JsonLd data={[ORGANIZATION_LD, WEBSITE_LD]} />
            <h1 className="sr-only">Conco y Punto — Tienda online</h1>
            {loading ? (
                <HomeSkeleton sections={sections} />
            ) : (
                <SectionRenderer sections={sections} data={data} />
            )}
        </div>
    );
}
