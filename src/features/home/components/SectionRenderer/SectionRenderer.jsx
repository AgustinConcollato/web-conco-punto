import { BannerCarousel } from '../BannerCarousel/BannerCarousel';
import { ProductsSection } from '../ProductsSection/ProductsSection';
import { PromotionsSection } from '../PromotionsSection/PromotionsSection';
import { TextBlock } from '../TextBlock/TextBlock';
import styles from './SectionRenderer.module.css';

export function SectionRenderer({ sections, data }) {
    return (sections ?? [])
        .filter(section => section.visible)
        .map(section => {
            const { id, type, settings } = section;

            if (type === 'banner') {
                return <BannerCarousel key={id} settings={settings} />;
            }

            if (type === 'text') {
                return <TextBlock key={id} settings={settings} />;
            }

            if (type === 'products') {
                const products = data.productsBySection[id] ?? [];
                const limited = settings?.limit ? products.slice(0, settings.limit) : products;

                return (
                    <ProductsSection
                        key={id}
                        title={settings?.title}
                        products={limited}
                        viewAllHref={settings?.viewAllHref || undefined}
                    />
                );
            }

            if (type === 'promotions') {
                const promotions = settings?.promotionId
                    ? data.promotions.filter(p => p.id === settings.promotionId)
                    : data.promotions;

                if (!promotions.length) return null;

                return (
                    <div key={id}>
                        <PromotionsSection promotions={promotions} title={settings?.title}/>
                    </div>
                );
            }

            return null;
        });
}
